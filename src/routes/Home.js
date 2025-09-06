import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import TopNav from "../components/Navbar"; // <-- ✅ import Navbar (TopNav)
export default function Home() {
    return (_jsxs(_Fragment, { children: [_jsx(TopNav, {}), _jsxs("main", { className: "p-6 text-white", children: [_jsx("h1", { className: "text-3xl font-bold", children: "Welcome to Sky3D" }), _jsx("p", { className: "mt-4 text-gray-400", children: "This is the home page. Use the navigation above to go to your dashboard." })] })] }));
}
