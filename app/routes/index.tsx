import { Form, useActionData, useTransition } from "@remix-run/react";
import { json } from "@remix-run/node";
import type {  ActionFunction } from "@remix-run/node";

interface ActionData {
  result?: string;
  error?: string;
}

export const action: ActionFunction = async({ request }) => {
  const body = await request.formData();
  try {
    const response = await fetch(`${process.env.API_URL}/math-translation`, {
      method: "POST",
      body: JSON.stringify({ text: body.get("problem") }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const result = await response.json();
    return json<ActionData>({
      result
    });
  } catch(error) {
    console.log(error);
    return json<ActionData>({
      error: "Ups! Algo fallo, intentalo nuevamente"
    });
  }
};

export default function Index() {
  const transition = useTransition();
  const data = useActionData()

  return (
    <div className="bg-gray-900">
      <div className="min-h-screen space-y-4 flex-col py-10 p-5 sm:max-w-xl sm:mx-auto">
        <h1 className="text-3xl font-bold text-white text-center">
          Ingresa el enunciado de matemática
        </h1>
        <Form method="post" className="">
          <div className="flex-col h-full w-full">
            <div className="relative rounded-xl overflow-auto">
              <label htmlFor="problem" className="sr-only">
                Enunciado de matemática
              </label>
              <textarea
                disabled={transition.state === "submitting"}
                id="problem"
                name="problem"
                required
                placeholder="¿Cuánto es 5 más 2?"
                className="w-full resize block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 focus:ring-offset-gray-900"
              />
            </div>
            <div className="mt-4">
              <button
                type="submit"
                className="block w-full py-3 px-4 rounded-md shadow bg-indigo-500 text-white font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 focus:ring-offset-gray-900"
              >
                {transition.state === "submitting"
                  ? "Calculando..."
                  : "Calcular"}
              </button>
            </div>
          </div>
        </Form>
        {!!data?.result && (
          <div className="text-white font-medium space-y-2">
            <h2 className="text-3xl font-bold">El resultado es:</h2>
            <p className="text-xl font-bold">{data.result}</p>
          </div>
        )}
        {!!data?.error && (
          <div className="text-white font-medium space-y-2">
            <p className="text-xl font-bold">{data.error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
