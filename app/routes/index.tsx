import {Form} from "@remix-run/react";

export default function Index() {
  return (
    <div className="bg-gray-900 min-h-screen space-y-4 flex-col py-10 p-5">
      <h1 className="text-3xl font-bold text-white text-center">
        Ingresa el enunciado de matemática
      </h1>
      <Form method="post" className="sm:max-w-xl sm:mx-auto">
        <div className="flex-col h-full w-full">
          <div className="relative rounded-xl overflow-auto">
            <label htmlFor="problem" className="sr-only">
              Enunciado
            </label>
            <textarea
              id="problem"
              placeholder="¿Cuanto es 5 más 2?"
              className="w-full resize block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 focus:ring-offset-gray-900"
            />
          </div>
          <div className="mt-4">
            <button
              type="submit"
              className="block w-full py-3 px-4 rounded-md shadow bg-indigo-500 text-white font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 focus:ring-offset-gray-900"
            >
              Calcular
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
