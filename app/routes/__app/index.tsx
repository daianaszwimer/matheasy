import { Form, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { json } from "@remix-run/node";
import type {  ActionFunction , LoaderFunction } from "@remix-run/node";
import { useEffect, useState } from "react";
import styles from "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import linkIcon from "~/assets/link.svg";

type MathStep = {option: string, equationOption: string}

interface ActionData {
  result?: string;
  error?: string;
  steps?: MathStep[],
  suggestions?: string[]
  text?: string;
}

interface LoaderData {
  defaultText?: string;
  url: string;
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

export const loader: LoaderFunction = async ({
  request,
}) => {
  const url = new URL(request.url);
  const defaultText = decodeURI(url.searchParams.get("text") || "");
  return json<LoaderData>({ defaultText, url: process.env.WEB_URL || "" });
};

export const action: ActionFunction = async({ request }) => {
  const body = await request.formData();
  try {
    const text = body.get("problem") as string;
    const mathExpression = await fetch(`${process.env.API_URL}/math-translation`, {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    const result = await mathExpression.json();
    if (result.error || result.result === "") {
      return json<ActionData>({
        error: "Ups! No puedo entender ese enunciado. Probá con otro",
      });
    }
    let [steps, suggestions] = await Promise.all([
      fetch(`${process.env.PROFEBOT_API}/exercise-resolution`, {
        method: "POST",
        // todo: matheasy me va a retornar el exercise tag en algun momento, por ahora esta hardcodeada
        body: JSON.stringify({ exercise: result.result, exerciseTag: "Equation" }),
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
    let suggestions_ = await suggestions.json();
    let steps_ = await steps.json();
    return json<ActionData>({
      result: result.result,
      // hardcodeado porque por ahora solo llega un step entonces para que se luzca mas
      steps: [...steps_, ...steps_] as MathStep[],
      suggestions: suggestions_ as string[],
      text
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
  const data = useActionData<ActionData>();
  const { defaultText, url } = useLoaderData<LoaderData>();
  const [hasLinkCopied, setHasLinkCopied] = useState(false);
  const [step, setStep] = useState<Steps>("first");
  const [stepByStep, setStepByStep] = useState<number>(0);
  // todo: scrollear al siguiente step cuando se toca el boton
  const offerSuggestions = step === "steps" && stepByStep > 0 && data?.steps?.length && stepByStep === data?.steps?.length - 1;
  function nextStep() {
    if (offerSuggestions) {
      // estoy en el ultimo step, voy a suggestions
      setStep("suggestions");
      return;
    }
    setStepByStep(prev => prev + 1);
  }
  useEffect(() => {
    setHasLinkCopied(false);
  }, [data?.result]);

  useEffect(() => {
    if (!data?.text) return;
    let history = JSON.parse(localStorage.getItem("ejercicios") || "[]");
    // me aseguro que hayan como mucho 5 enunciados
    // todo: si el elemento ya existe guardar duplicado o moverlo de lugar al ultimo?
    if (history.length < 5) {
      history.push(data?.text);
    } else {
      history.shift();
      history.push(data?.text);
    }
    localStorage.setItem("ejercicios", JSON.stringify(history));
  }, [data?.text]);

  return (
    <>
      <h1 className="text-3xl font-bold text-center">
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
              defaultValue={defaultText}
              required
              placeholder="¿Cuánto es 5 más 2?"
              className="w-full resize block w-full px-4 py-3 rounded-md border-0 text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 focus:ring-offset-gray-900"
            />
          </div>
          <div className="mt-4">
            <button
              type="submit"
              onClick={() => setStep("first")}
              className="block w-full py-3 px-4 rounded-md shadow bg-indigo-500 font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 focus:ring-offset-gray-900"
            >
              {transition.state === "submitting"
                ? "Calculando..."
                : "Calcular"}
            </button>
          </div>
        </div>
      </Form>
      {!!data?.result && (
        <div className="font-medium space-y-2">
          <h2 className="text-xl font-bold">Expresión matemática:</h2>
          <p className="text-md font-bold"><Latex>{`$${data.result}$`}</Latex></p>
        </div>
      )}
      {!!data?.error && (
        <div className="font-medium space-y-2">
          <p className="text-xl font-bold">{data.error}</p>
        </div>
      )}
      {!!data?.result &&
      <button
        className="rounded-lg font-bold p-4 bg-indigo-500"
        onClick={() => {
          setStep("steps");
          setStepByStep(0);
        }}
      >
        Ver el paso a paso de la resolución
      </button>
      }
      {/* timeline */}
      {step !== "first" && <>
        <div className="container mx-auto w-full h-full relative">
          {data?.steps?.map((s: MathStep, index: number) => {
            if (stepByStep < index) {
              return (
                <div key={`${s.option} ${index}`}
                  className="border-2-2 border-white border-l gap-8 items-center w-full wrap overflow-hidden p-10 h-full flex ml-5">
                  <div className="z-10 flex items-center bg-white shadow-xl rounded-full absolute left-1">
                    <h1
                      className="mx-auto font-semibold text-lg text-gray-900 w-8 h-8 flex items-center justify-center">{index + 1}</h1>
                  </div>
                  <button
                    className="w-full flex w-full blur"
                    onClick={nextStep}
                  >
                    <div className="flex-1 bg-white rounded-lg shadow-xl px-6 py-4">
                      <h3 className="mb-3 font-bold text-gray-800 text-xl">{s.option}</h3>
                      <p className="text-sm leading-snug tracking-wide text-gray-900"><Latex>{`$${s.equationOption}$`}</Latex></p>
                    </div>
                  </button>
                  <button
                    onClick={nextStep}
                    className="absolute rounded-lg font-bold p-4 bg-indigo-500"
                    style={{ left: "calc(50% - 60px)" }}>
                    Siguiente paso
                  </button>
                </div>
              );
            }
            return (
              <div key={`${s.option} ${index}`}
                className="border-2-2 border-white border-l gap-8 items-center w-full wrap overflow-hidden p-10 h-full flex ml-5">
                <div className="z-10 flex items-center bg-white shadow-xl rounded-full absolute left-1">
                  <h1
                    className="mx-auto font-semibold text-lg text-gray-900 w-8 h-8 flex items-center justify-center">{index + 1}</h1>
                </div>
                <div className="w-full flex">
                  <div className="flex-1 bg-white rounded-lg shadow-xl px-6 py-4">
                    <h3 className="mb-3 font-bold text-gray-800 text-xl">{s.option}</h3>
                    <p className="text-sm leading-snug tracking-wide text-gray-900"><Latex>{`$${s.equationOption}$`}</Latex></p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {offerSuggestions &&
        <button
          className="rounded-lg font-bold p-4 bg-indigo-500"
          onClick={() => setStep("suggestions")}
        >
          Ver ejercicios parecidos
        </button>
        }
      </>
      }
      {step === "suggestions" && <div>Sugerencias</div>}
      {!!data?.result && <button
        className="rounded-lg text-sm p-3 bg-teal-600 flex flex-row gap-2 items-center"
        onClick={async () => {
          const link = `${url}?text=${encodeURI(data?.text || "")}`;
          if ("clipboard" in navigator) {
            await navigator.clipboard.writeText(link);
            setHasLinkCopied(true);
          } else {
            document.execCommand("copy", true, link);
            setHasLinkCopied(true);
          }
        }}
      >
        <img src={linkIcon} alt="" className="w-4"/>
        {hasLinkCopied ? "Copiado!" : "Copia el link al ejercicio y compartilo!"}
      </button>}
    </>
  );
}
