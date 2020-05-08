export default function Footer() {
  return (
    <div className="bg-gray-100 flex justify-center">
      <div className="w-full max-w-5xl py-4 px-8 text-gray-700 text-sm flex">
        <p>&copy; 2020-present Michael Helvey.</p>
        <a
          href="https://github.com/michaelhelvey"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-4 underline hover:text-green-700"
        >
          See the code.
        </a>
      </div>
    </div>
  )
}
