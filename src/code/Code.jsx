// import { NavbarComponent } from "../../components/navbar";
import { NotebookComponent } from "./components/notebook.tsx";

function Code() {
  return (
    <div className="min-h-screen bg-background">
      {/* <NavbarComponent /> */}
      <main className="container mx-auto px-4 py-8 max-w-[80%]">
        <NotebookComponent />
      </main>
    </div>
  );
}

export default Code;
