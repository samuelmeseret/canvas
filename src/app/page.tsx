import { CreateBoardDialog } from "@/components/landing/create-board-dialog";

export default function HomePage() {
  return (
    <main className="landingRoot">
      <div className="grainLayer" aria-hidden />
      <section className="landingHero">
        <p className="eyebrow">Realtime Portfolio Project</p>
        <h1>
          Collab<span>Board</span>
        </h1>
        <p className="leadCopy">
          Draw, annotate, and brainstorm with your team on a shared infinite canvas.
          Built to showcase low-latency collaboration, presence, and production-grade UI.
        </p>
        <div className="heroActions">
          <CreateBoardDialog />
          <a href="#architecture" className="ghostAction">
            Architecture
          </a>
        </div>
      </section>

      <section className="featureGrid" id="architecture">
        <article>
          <h2>Live Presence</h2>
          <p>
            Cursor movement and participant identity are broadcast with Liveblocks presence
            updates at interaction speed.
          </p>
        </article>
        <article>
          <h2>Persistent Boards</h2>
          <p>
            Drawing records sync through Liveblocks storage while board metadata lives in
            Supabase for fast retrieval by URL.
          </p>
        </article>
        <article>
          <h2>Canvas Performance</h2>
          <p>
            Tldraw handles shape rendering and interactions, while local optimistic updates keep
            drawing responsive.
          </p>
        </article>
      </section>
    </main>
  );
}
