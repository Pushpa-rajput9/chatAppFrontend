import { Outlet, useParams } from "react-router-dom";
import Sidebar from "../chat/Sidebar.jsx";
import EmptyChat from "../chat/EmptyChat.jsx";

const AppLayout = () => {
  const { conversationId } = useParams();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <div className={`${conversationId ? "hidden md:flex" : "flex"} h-full w-full md:w-auto`}>
        <Sidebar />
      </div>
      <div className={`${conversationId ? "flex" : "hidden md:flex"} h-full flex-1`}>
        {conversationId ? <Outlet /> : <EmptyChat />}
      </div>
    </div>
  );
};

export default AppLayout;
