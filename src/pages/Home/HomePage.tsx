import { ScrollDownIndicator } from "../../components";

export const HomePage = () => {
  return (
    <div className="w-full flex flex-col">
      <div className="w-full min-h-[91vh] relative flex items-center justify-center ">
        <p className="text-6xl font-bold text-center">
          Welcome to team
          <br />
          <span className="text-9xl inline">Big</span> Real Estate
        </p>

        <div className="absolute w-full h-full top-0 left-0 flex items-end justify-center">
          <div className="translate-y-[50px]">
            <ScrollDownIndicator />
          </div>
        </div>
      </div>

      <div className="w-full min-h-[75vh] relative flex flex-col items-center justify-center gap-y-4 ">
        <p className="text-4xl font-bold text-center">Working on project:</p>
        <p className="text-5xl">ZLA - Real Estate Lead Gen and CRM</p>
      </div>

      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center gap-y-4 ">
        <p className="text-4xl font-bold text-center">Brought to you by:</p>

        <div className="flex flex-col items-center justify-center">
          <div className=" flex flex-row gap-x-15">
            <div className="flex flex-col gap-y-4">
              <p className="text-5xl">
                <span className="font-bold">R</span>obert Huang
              </p>
              <p className="text-5xl">
                <span className="font-bold">A</span>ndrew Moulton
              </p>
            </div>
            <div className="flex flex-col gap-y-4 items-center justify-center">
              <p className="text-5xl">
                <span className="font-bold">J</span>onathan Zhu
              </p>
            </div>
            <div className="flex flex-col gap-y-4">
              <p className="text-5xl">
                <span className="font-bold">N</span>iccolls Evsseef
              </p>
              <p className="text-5xl">
                <span className="font-bold">C</span>olin Tondreau
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center gap-y-4 ">
        <p className="text-4xl font-bold text-center">Coached by:</p>
        <p className="text-5xl">Dmitry Lukyanov</p>
      </div>

      <div className="w-full min-h-[75vh] flex flex-col items-center justify-center gap-y-4 ">
        <p className="text-4xl font-bold text-center">Sponsored by:</p>
        <p className="text-5xl">Cora sur Los Cabos</p>
      </div>
    </div>
  );
};
