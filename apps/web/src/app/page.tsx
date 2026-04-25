import MessageInput from "@/components/MessageInput";

export default function Home() {
  return (
    <main className="page-root">
      <div className="center-container">
        <div className="brand">
          <h1 className="brand-title">Ask anything</h1>
          <p className="brand-sub">Type or speak your message below</p>
        </div>
        <MessageInput />
      </div>
    </main>
  );
}
