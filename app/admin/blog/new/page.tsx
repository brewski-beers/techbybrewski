import BlogPostForm from "@/components/admin/BlogPostForm/BlogPostForm";
import styles from "@/styles/adminForm.module.css";

export default function NewBlogPostPage() {
  return (
    <div className={styles.page}>
      <h1 className="text-h2">New Post</h1>
      <BlogPostForm />
    </div>
  );
}
