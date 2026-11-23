import Link from "next/link";

const ReviewPage = () => {
    return (
        <main className="flex min-h-screen items-center justify-center bg-white px-6 pt-20 text-[#20201E]">

            <div className="mx-auto max-w-lg text-center">

                <svg
                    className="mx-auto mb-8 h-10 w-10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={1.2}
                    aria-hidden="true"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path
                        d="m8 12 3 3 5-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>

                <h1 className="font-serif text-4xl font-normal tracking-tight sm:text-5xl">
                    Article under review.
                </h1>

                <p className="mt-6 text-base leading-relaxed text-neutral-500">
                    Your article has been successfully submitted
                    and is awaiting editorial approval.
                    It will be published once approved.
                </p>

                <Link
                    href="/"
                    className="mt-10 inline-block text-sm underline underline-offset-4 transition-colors hover:text-neutral-500"
                >
                    Return to home →
                </Link>

            </div>

        </main>
    );
};

export default ReviewPage;