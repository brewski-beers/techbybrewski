/**
 * Firestore Security Rules — integration tests
 *
 * Requires the Firebase emulator to be running:
 *   firebase emulators:start --only firestore
 *
 * Run with:
 *   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 vitest run firestore/__tests__/firestore.rules.test.ts
 *
 * These tests use @firebase/rules-unit-testing and talk directly to the
 * emulator. No mocks. The rules file at firestore.rules is loaded before
 * each suite.
 */

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  afterEach,
} from "vitest";
import {
  initializeTestEnvironment,
  RulesTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import { readFileSync } from "fs";
import { resolve } from "path";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

const PROJECT_ID = "techbybrewski-test";
const RULES_PATH = resolve(__dirname, "../../firestore.rules");

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: {
      rules: readFileSync(RULES_PATH, "utf8"),
      host: "127.0.0.1",
      port: 8080,
    },
  });
});

afterEach(async () => {
  await testEnv.clearFirestore();
});

afterAll(async () => {
  await testEnv.cleanup();
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Unauthenticated Firestore client */
function unauthed() {
  return testEnv.unauthenticatedContext().firestore();
}

/** Client authenticated as a plain user (no custom claims) */
function asUser(uid: string) {
  return testEnv.authenticatedContext(uid).firestore();
}

/** Client authenticated with admin custom claim */
function asAdmin(uid: string) {
  return testEnv.authenticatedContext(uid, { admin: true }).firestore();
}

/** Client authenticated with client custom claim */
function asClient(uid: string) {
  return testEnv.authenticatedContext(uid, { client: true }).firestore();
}

// Seed a document via the admin SDK (bypasses rules)
async function seed(path: string, data: Record<string, unknown>) {
  await testEnv.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), path), data);
  });
}

// ---------------------------------------------------------------------------
// Unauthenticated access
// ---------------------------------------------------------------------------

describe("Unauthenticated access", () => {
  it("denies read of a client document", async () => {
    // Given: a client doc exists
    await seed("clients/client-1", { email: "a@example.com" });

    // When: unauthenticated user attempts to read
    // Then: read is denied
    await assertFails(getDoc(doc(unauthed(), "clients/client-1")));
  });

  it("denies write to a client document", async () => {
    // Given: no auth context
    // When: unauthenticated user attempts to write
    // Then: write is denied
    await assertFails(
      setDoc(doc(unauthed(), "clients/attacker"), { email: "attacker@evil.com" })
    );
  });

  it("denies read of a client invoice", async () => {
    // Given: an invoice exists
    await seed("clients/client-1/invoices/inv-1", { amountCents: 5000 });

    // When: unauthenticated user attempts to read
    // Then: read is denied
    await assertFails(
      getDoc(doc(unauthed(), "clients/client-1/invoices/inv-1"))
    );
  });

  it("allows read of a published service (public collection)", async () => {
    // Given: a published service exists
    await seed("services/svc-1", { name: "Web Design", isPublished: true });

    // When: unauthenticated user reads a published service
    // Then: read is allowed
    await assertSucceeds(getDoc(doc(unauthed(), "services/svc-1")));
  });

  it("allows creating a contact submission (public contact form)", async () => {
    // Given: unauthenticated visitor fills the contact form
    // When: they submit (create doc)
    // Then: create is allowed
    await assertSucceeds(
      addDoc(collection(unauthed(), "contactSubmissions"), {
        name: "Visitor",
        email: "visitor@example.com",
        message: "Hello",
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Client isolation — user A cannot read user B's data
// ---------------------------------------------------------------------------

describe("Client isolation", () => {
  it("allows a client to read their own profile", async () => {
    // Given: client A's profile exists
    await seed("clients/client-a", { email: "a@example.com" });

    // When: client A reads their own doc
    // Then: read is allowed
    await assertSucceeds(
      getDoc(doc(asClient("client-a"), "clients/client-a"))
    );
  });

  it("denies a client reading another client's profile", async () => {
    // Given: client B's profile exists
    await seed("clients/client-b", { email: "b@example.com" });

    // When: client A tries to read client B's doc
    // Then: read is denied
    await assertFails(
      getDoc(doc(asClient("client-a"), "clients/client-b"))
    );
  });

  it("denies a client reading another client's invoice", async () => {
    // Given: client B has an invoice
    await seed("clients/client-b/invoices/inv-b", { amountCents: 9900 });

    // When: client A tries to read client B's invoice
    // Then: read is denied
    await assertFails(
      getDoc(doc(asClient("client-a"), "clients/client-b/invoices/inv-b"))
    );
  });

  it("allows a client to read their own invoice", async () => {
    // Given: client A has an invoice
    await seed("clients/client-a/invoices/inv-a", { amountCents: 9900 });

    // When: client A reads their own invoice
    // Then: read is allowed
    await assertSucceeds(
      getDoc(doc(asClient("client-a"), "clients/client-a/invoices/inv-a"))
    );
  });

  it("denies a client writing to another client's messages", async () => {
    // Given: client B exists
    await seed("clients/client-b", { email: "b@example.com" });

    // When: client A tries to write a message on client B's record
    // Then: write is denied
    await assertFails(
      addDoc(
        collection(asClient("client-a"), "clients/client-b/messages"),
        { body: "injected", senderRole: "client" }
      )
    );
  });
});

// ---------------------------------------------------------------------------
// Admin access
// ---------------------------------------------------------------------------

describe("Admin access", () => {
  it("allows admin to read any client profile", async () => {
    // Given: a client profile exists
    await seed("clients/client-x", { email: "x@example.com" });

    // When: admin reads the profile
    // Then: read is allowed
    await assertSucceeds(
      getDoc(doc(asAdmin("admin-1"), "clients/client-x"))
    );
  });

  it("allows admin to write to a client profile", async () => {
    // Given: admin context
    // When: admin writes a new client
    // Then: write is allowed
    await assertSucceeds(
      setDoc(doc(asAdmin("admin-1"), "clients/new-client"), {
        email: "new@example.com",
      })
    );
  });

  it("denies admin deleting an activity log entry", async () => {
    // Given: an activity log entry exists
    await seed("activityLog/log-1", { action: "CREATE" });

    // When: admin tries to delete it (rule: update/delete is false)
    // Then: delete is denied
    await assertFails(
      deleteDoc(doc(asAdmin("admin-1"), "activityLog/log-1"))
    );
  });
});

// ---------------------------------------------------------------------------
// Public collections — isPublished gating
// ---------------------------------------------------------------------------

describe("Public collections — isPublished gating", () => {
  const PUBLIC_COLLECTIONS = ["services", "caseStudies", "testimonials", "faqs"];

  for (const col of PUBLIC_COLLECTIONS) {
    it(`denies unauthenticated read of unpublished ${col} document`, async () => {
      // Given: an unpublished document exists
      await seed(`${col}/doc-1`, { isPublished: false, name: "Hidden" });

      // When: unauthenticated user reads it
      // Then: read is denied
      await assertFails(getDoc(doc(unauthed(), `${col}/doc-1`)));
    });

    it(`allows admin to read unpublished ${col} document`, async () => {
      // Given: an unpublished document exists
      await seed(`${col}/doc-1`, { isPublished: false, name: "Hidden" });

      // When: admin reads it
      // Then: read is allowed (admin bypasses isPublished check)
      await assertSucceeds(getDoc(doc(asAdmin("admin-1"), `${col}/doc-1`)));
    });

    it(`allows admin to write to ${col}`, async () => {
      // Given: admin context
      // When: admin creates a document
      // Then: write is allowed
      await assertSucceeds(
        setDoc(doc(asAdmin("admin-1"), `${col}/new-doc`), {
          isPublished: false,
          name: "Draft",
        })
      );
    });
  }
});

// ---------------------------------------------------------------------------
// contactSubmissions — public read denied
// ---------------------------------------------------------------------------

describe("contactSubmissions — access control", () => {
  it("denies unauthenticated read of contactSubmissions", async () => {
    // Given: a contact submission exists
    await seed("contactSubmissions/sub-1", {
      name: "Visitor",
      email: "v@example.com",
    });

    // When: unauthenticated user reads it
    // Then: read is denied
    await assertFails(
      getDoc(doc(unauthed(), "contactSubmissions/sub-1"))
    );
  });

  it("allows admin to read contactSubmissions", async () => {
    // Given: a contact submission exists
    await seed("contactSubmissions/sub-1", {
      name: "Visitor",
      email: "v@example.com",
    });

    // When: admin reads it
    // Then: read is allowed
    await assertSucceeds(
      getDoc(doc(asAdmin("admin-1"), "contactSubmissions/sub-1"))
    );
  });
});

// ---------------------------------------------------------------------------
// Client portal — messages and invoice write restrictions
// ---------------------------------------------------------------------------

describe("Client portal — subcollection access", () => {
  it("allows a client to create a message in their own subcollection", async () => {
    // Given: client1 is authenticated
    // When: they create a message in clients/client1/messages
    // Then: write succeeds
    await assertSucceeds(
      addDoc(
        collection(asClient("client1"), "clients/client1/messages"),
        { body: "Hello admin", senderRole: "client" }
      )
    );
  });

  it("denies a client writing to their own invoices subcollection", async () => {
    // Given: client1 is authenticated
    // When: they attempt to write an invoice in clients/client1/invoices
    // Then: write is denied (clients can only read invoices, not write)
    await assertFails(
      setDoc(doc(asClient("client1"), "clients/client1/invoices/inv-fake"), {
        amountCents: 0,
        status: "draft",
      })
    );
  });
});

// ---------------------------------------------------------------------------
// Default deny — unmatched paths
// ---------------------------------------------------------------------------

describe("Default deny", () => {
  it("denies unauthenticated read of an undefined collection", async () => {
    // Given: any user
    // When: they access a path that matches no rule
    // Then: access is denied
    await assertFails(
      getDoc(doc(unauthed(), "unknownCollection/some-doc"))
    );
  });

  it("denies admin read of an undefined collection", async () => {
    // Given: admin user
    // When: they access an undefined collection path
    // Then: access is still denied (admin has no blanket grant — only specific collections)
    await assertFails(
      getDoc(doc(asAdmin("admin-1"), "unknownCollection/some-doc"))
    );
  });
});
