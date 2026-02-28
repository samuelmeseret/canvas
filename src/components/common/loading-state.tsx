export function LoadingState({ message }: { message: string }) {
  return (
    <div className="roomLoading">
      <div>
        <h2>Loading room...</h2>
        <p>{message}</p>
      </div>
    </div>
  );
}
