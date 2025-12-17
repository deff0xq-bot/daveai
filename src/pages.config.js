import Home from './pages/Home';
import Editor from './pages/Editor';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import UserManagement from './pages/UserManagement';
import Subscriptions from './pages/Subscriptions';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Home": Home,
    "Editor": Editor,
    "Projects": Projects,
    "Settings": Settings,
    "UserManagement": UserManagement,
    "Subscriptions": Subscriptions,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};