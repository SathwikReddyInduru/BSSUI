import { Link } from "react-router-dom";

function Sidebar() {
    return (
        <aside>
            <ul>
                <li>
                    <Link to="/dashboard">Dashboard</Link>
                </li>

                <li>
                    <Link to="/voucher/profile">
                        Voucher Profile
                    </Link>
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;