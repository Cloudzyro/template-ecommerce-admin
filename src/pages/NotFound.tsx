import { Link } from "react-router";
import { Pot } from "../components/Pot";
import { btn } from "../components/ui";
import { useTitle } from "../lib/useTitle";

export function NotFound() {
  useTitle("Not found");
  return (
    <div className="enter mx-auto flex max-w-md flex-col items-center py-24 text-center">
      <Pot shape="bowl" glaze="ash" className="size-24" />
      <h1 className="page-title mt-6 text-[32px] leading-[1.15]">Nothing on this shelf</h1>
      <p className="mt-3 text-fg2">The page you asked for doesn't exist, or the order or product was removed.</p>
      <Link to="/" className={`${btn.primary} mt-8`}>
        Back to overview
      </Link>
    </div>
  );
}
