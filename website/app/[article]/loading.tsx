// app/[article]/loading.tsx

export default function Loading() {
    return (
        <div className="min-h-screen bg-white text-black p-10 flex flex-col items-center justify-center">
            <div className="w-10 h-10 border-4 border-black border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-serif text-xl font-bold animate-pulse">
                Generating your article...
            </p>
        </div>
    );
}
