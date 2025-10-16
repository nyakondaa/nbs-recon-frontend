import EditMyAccount from "@/app/components/EditMyAccount";
import { getLoggedInUser } from "@/app/services/logedUserHelper";

const SearchPage = async () => {
  const loggedInUser = await getLoggedInUser();

  if (!loggedInUser) {
    return <div>Please log in to edit your account.</div>;
  }

  return <EditMyAccount user={loggedInUser} />;
};

export default SearchPage;
