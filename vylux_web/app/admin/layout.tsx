import Header from "./components/header/page";
import Footer from "./components/footer/page";
import styles from "./adminlayout.module.css";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.adminLayout}>
      <Header />

      <main className={styles.mainContent}>
        {children}
      </main>

      <Footer />
    </div>
  );
}