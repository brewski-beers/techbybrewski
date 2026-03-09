/* eslint-disable no-restricted-syntax */
"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import { ReactNode } from "react";
import styles from "./SortableList.module.css";

// ── Drag Handle ────────────────────────────────────────────

interface DragHandleProps {
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes;
}

export function DragHandle({ listeners, attributes }: DragHandleProps) {
  return (
    <button type="button" className={styles.handle} {...listeners} {...attributes} aria-label="Drag to reorder">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="5" cy="4" r="1.5" fill="currentColor" />
        <circle cx="11" cy="4" r="1.5" fill="currentColor" />
        <circle cx="5" cy="8" r="1.5" fill="currentColor" />
        <circle cx="11" cy="8" r="1.5" fill="currentColor" />
        <circle cx="5" cy="12" r="1.5" fill="currentColor" />
        <circle cx="11" cy="12" r="1.5" fill="currentColor" />
      </svg>
    </button>
  );
}

// ── Sortable Item ──────────────────────────────────────────

interface HandleProps {
  listeners?: SyntheticListenerMap;
  attributes?: DraggableAttributes;
}

interface SortableItemProps {
  id: string;
  children: (handleProps: HandleProps) => ReactNode;
}

export function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`${styles.item} ${isDragging ? styles.dragging : ""}`}
    >
      {children({ listeners, attributes })}
    </div>
  );
}

// ── Sortable List Container ────────────────────────────────

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void;
  children: (item: T, handleProps: HandleProps) => ReactNode;
}

export function SortableList<T extends { id: string }>({ items, onReorder, children }: SortableListProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      onReorder(arrayMove(items, oldIndex, newIndex));
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        {items.map((item) => (
          <SortableItem key={item.id} id={item.id}>
            {(handleProps) => children(item, handleProps)}
          </SortableItem>
        ))}
      </SortableContext>
    </DndContext>
  );
}
