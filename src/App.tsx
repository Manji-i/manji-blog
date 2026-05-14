import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import ArticleList from './pages/ArticleList';
import ArticleDetail from './pages/ArticleDetail';
import Thoughts from './pages/Thoughts';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminArticles from './pages/admin/Articles';
import AdminArticleEdit from './pages/admin/ArticleEdit';
import AdminCategories from './pages/admin/Categories';
import AdminSettings from './pages/admin/Settings';
import AdminThoughts from './pages/admin/Thoughts';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="articles" element={<ArticleList />} />
          <Route path="articles/:slug" element={<ArticleDetail />} />
          <Route path="thoughts" element={<Thoughts />} />
        </Route>

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="articles" element={<AdminArticles />} />
          <Route path="articles/new" element={<AdminArticleEdit />} />
          <Route path="articles/:id/edit" element={<AdminArticleEdit />} />
          <Route path="thoughts" element={<AdminThoughts />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
