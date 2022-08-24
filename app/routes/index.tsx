import { Form, useActionData, useTransition } from "@remix-run/react";
import { json } from "@remix-run/node";
import type {  ActionFunction } from "@remix-run/node";
import icon from "~/assets/icon.png";
import { useEffect, useState } from "react";
import styles from "katex/dist/katex.min.css";
import Latex from "react-latex-next";

interface ActionData {
  result?: string;
  error?: string;
  steps?: { option: string, equationOption: string}[],
  suggestions?: string[]
}

export function links() {
  return [
    {
      rel: "stylesheet",
      href: "https://fonts.googleapis.com/css2?family=Comfortaa:wght@300;400;500;700&display=swap",
    },
    { rel: "stylesheet", href: styles },
  ];
}

export const action: ActionFunction = async({ request }) => {
  const body = await request.formData();
  try {
    const mathExpression = await fetch(`${process.env.API_URL}/math-translation`, {
      method: "POST",
      body: JSON.stringify({ text: body.get("problem") }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const result = await mathExpression.json();
    if (result.error) {
      return json<ActionData>({
        error: "Ups! No puedo entender ese enunciado. Probá con otro"
      });
    }
    let [steps, suggestions] = await Promise.all([
      fetch(`${process.env.PROFEBOT_API}/exercise-resolution`, {
        method: "POST",
        body: JSON.stringify({ exercise: result.result }),
        headers: {
          "Content-Type": "application/json"
        }
      }),
      fetch(`${process.env.PROFEBOT_API}/suggestions`, {
        method: "POST",
        body: JSON.stringify({ exercise: result.result }),
        headers: {
          "Content-Type": "application/json"
        }
      })
    ]);
    let [steps_, suggestions_] = await Promise.all([
      steps.json() as Promise<{ option: string, equationOption: string}[]>,
      suggestions.json() as Promise<string[]>,
    ]);
    console.log(steps, suggestions, "----");
    return json<ActionData>({
      result: result.result,
      steps: steps_,
      suggestions: suggestions_,
    });
  } catch(error) {
    console.log(error);
    return json<ActionData>({
      error: "Ups! Algo falló, inténtalo nuevamente"
    });
  }
};

type Steps = "first" | "steps" | "suggestions"

export default function Index() {
  const transition = useTransition();
  const data = useActionData();
  const [step, setStep] = useState<Steps>("first");
  const [stepByStep, setStepByStep] = useState<number>(0);
  // todo: scrollear al siguiente step cuando se toca el boton
  const offerSuggestions = step === "steps" && stepByStep > 0 &&stepByStep === data?.steps?.length - 1;
  function nextStep() {
    if (offerSuggestions) {
      // estoy en el ultimo step, voy a suggestions
      setStep("suggestions");
      return;
    }
    setStepByStep(prev => prev++);
  }

  return (
    <div className="bg-gray-900 font-['Comfortaa']">
      <div className="min-h-[calc(100vh_-_32px_-_16px_-_16px)] space-y-4 flex-col pt-10 p-5 sm:max-w-2xl sm:mx-auto text-white">
        <h1 className="text-3xl font-bold text-white text-center">
          Ingresá el enunciado de matemática
        </h1>
        <Form method="post" className="">
          <div className="flex-col h-full w-full mx-auto">
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
                onClick={() => setStep("first")}
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
            <h2 className="text-xl font-bold">Expresión matemática:</h2>
            <p className="text-md font-bold"><Latex>{`$${data.result}$`}</Latex></p>
          </div>
        )}
        {!!data?.error && (
          <div className="text-white font-medium space-y-2">
            <p className="text-xl font-bold">{data.error}</p>
          </div>
        )}
        {!!data?.result &&
          <button
            className="rounded-lg text-white font-bold p-4 bg-indigo-500"
            onClick={() => setStep("steps")}
          >
            Ver el paso a paso de la resolución
          </button>
        }
        {/* timeline */}
        {step !== "first" && <>
          <div className="container mx-auto w-full h-full relative">
            <div
              className="border-2-2 border-white border-l gap-8 items-center w-full wrap overflow-hidden p-10 h-full flex ml-5">
              <div className="z-10 flex items-center bg-white shadow-xl rounded-full absolute left-1">
                <h1
                  className="mx-auto font-semibold text-lg text-gray-900 w-8 h-8 flex items-center justify-center">1</h1>
              </div>
              <div className="flex">
                <div className="bg-white rounded-lg shadow-xl px-6 py-4">
                  <h3 className="mb-3 font-bold text-gray-800 text-xl">Lorem Ipsum</h3>
                  <p className="text-sm leading-snug tracking-wide text-gray-900">Lorem Ipsum is simply
                    dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
                    dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to
                    make a type specimen book.</p>
                </div>
              </div>
            </div>

            <div
              className="border-2-2 border-white border-l gap-8 items-center w-full wrap overflow-hidden p-10 h-full flex ml-5">
              <div className="z-10 flex items-center bg-white shadow-xl rounded-full absolute left-1">
                <h1
                  className="mx-auto font-semibold text-lg text-gray-900 w-8 h-8 flex items-center justify-center">2</h1>
              </div>
              {stepByStep < 2 && <>
                <button
                  className="flex blur peer"
                  onClick={() => setStepByStep(2)}
                >
                  <div className="bg-white rounded-lg shadow-xl px-6 py-4">
                    <h3 className="mb-3 font-bold text-gray-800 text-xl">Lorem Ipsum</h3>
                    <p className="text-sm leading-snug tracking-wide text-gray-900">Lorem Ipsum is simply
                      dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
                      dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to
                      make a type specimen book.</p>
                  </div>
                </button>
                <button
                  onClick={() => setStepByStep(2)}
                  className="peer-hover:animate-bounce hover:animate-bounce absolute rounded-lg text-white font-bold p-4 bg-indigo-500"
                  style={{ left: "calc(50% - 60px)" }}>
                  Siguiente paso
                </button>
              </>
              }
              {stepByStep >= 2 && <>
                <div className="flex">
                  <div className="bg-white rounded-lg shadow-xl px-6 py-4">
                    <h3 className="mb-3 font-bold text-gray-800 text-xl">Lorem Ipsum</h3>
                    <p className="text-sm leading-snug tracking-wide text-gray-900">Lorem Ipsum is simply
                      dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
                      dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to
                      make a type specimen book.</p>
                  </div>
                </div>
              </>
              }
            </div>

            <div
              className="border-2-2 border-white border-l gap-8 items-center w-full wrap overflow-hidden p-10 h-full flex ml-5">
              <div className="z-10 flex items-center bg-white shadow-xl rounded-full absolute left-1">
                <h1
                  className="mx-auto font-semibold text-lg text-gray-900 w-8 h-8 flex items-center justify-center">3</h1>
              </div>
              <button className="flex blur peer">
                <div className="bg-white rounded-lg shadow-xl px-6 py-4">
                  <h3 className="mb-3 font-bold text-gray-800 text-xl">Lorem Ipsum</h3>
                  <p className="text-sm leading-snug tracking-wide text-gray-900">Lorem Ipsum is simply
                    dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard
                    dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to
                    make a type specimen book.</p>
                </div>
              </button>
              <button
                className="peer-hover:animate-bounce hover:animate-bounce absolute rounded-lg text-white font-bold p-4 bg-indigo-500"
                style={{ left: "calc(50% - 60px)" }}>
                Siguiente paso
              </button>
            </div>
          </div>
          <button
            className="rounded-lg text-white font-bold p-4 bg-indigo-500"
            onClick={() => setStep("suggestions")}
          >
            Ver ejercicios parecidos
          </button>
        </>
        }
        {step === "suggestions" && <div>Sugerencias</div>}
      </div>
      <footer className="flex justify-center space-x-3 items-center border-t-2 border-gray-700 py-4">
        <img src={icon} alt="" className="h-8"/>
        <span className="text-white font-medium">MathEasy © 2022</span>
      </footer>
    </div>
  );
}
