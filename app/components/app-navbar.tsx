
import { Bell, Search, User } from "lucide-react";
import { getLoggedInUser } from "../services/logedUserHelper";

export async function Navbar({children}: {children?: React.ReactNode}) {

    const username = await getLoggedInUser() || "User";
  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
       
        <div className="flex items-center ">
          {children && <div>{children}</div>}
        </div>

        
        <div className="flex items-center space-x-4">
     
          <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-600" />
          </button>

     
          <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">{username.sub}</span>
          </button>
        </div>
      </div>
    </nav>
  );
}