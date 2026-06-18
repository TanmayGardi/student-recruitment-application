import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function DashboardLayout({ children }) {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="main-content">
        <TopBar />
        <main className="page-container animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
