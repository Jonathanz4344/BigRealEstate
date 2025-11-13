import { Link } from "react-router";

export const NotFoundPage = () => {
  return (
    <div className="w-full h-[90vh] flex flex-col gap-y-2 items-center justify-center">
      <p className="text-6xl font-bold">Oops!</p>
      <p className="text-2xl">Sorry, page not found</p>
      <p className="text-2xl">
        Back to{" "}
        <Link className="underline text-blue-300" to={"/"}>
          Home
        </Link>
      </p>
    </div>
  );
};
