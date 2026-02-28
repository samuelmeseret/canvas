import Link from "next/link";

export default function NotFound() {
  return (
    <main className="roomError">
      <div>
        <h1>Board not found</h1>
        <p>The board URL is invalid or this board has been removed.</p>
        <Link className="primaryAction" href="/">
          Back to home
        </Link>
      </div>
    </main>
  );
}
