import { Form, useActionData, useLoaderData, useTransition } from "@remix-run/react";
import { json } from "@remix-run/node";
import type {  ActionFunction , LoaderFunction } from "@remix-run/node";
import { useEffect, useRef, useState } from "react";
import styles from "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import linkIcon from "~/assets/link.svg";
import infoIcon from "~/assets/info.svg";

type MathStep = {
  option: string,
  equationOptions: {
    content: string;
    equationOptionType: "TEXT" | "LATEX"
  }[],
  info?: string
}

type Tag = "Equation" | "Function";

interface ActionData {
  result?: string | null;
  error?: string;
  steps?: MathStep[],
  suggestions?: string[]
  text?: string;
  type?: Tag | null;
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
  const defaultText = decodeURIComponent(url.searchParams.get("text") || "");
  return json<LoaderData>({ defaultText, url: process.env.WEB_URL || "" });
};

export const action: ActionFunction = async({ request }) => {
  const body = await request.formData();
  let result = {
    error: null,
    result: {
      expression: null,
      tag: null,
    }
  };
  try {
    const text = body.get("problem") as string;
    const mathExpression = await fetch(`${process.env.API_URL}/math-translation`, {
      method: "POST",
      body: JSON.stringify({ text }),
      headers: {
        "Content-Type": "application/json"
      }
    });
    result = await mathExpression.json();
    console.log(result);
    // @ts-ignore
    if (result.error || result.result === "") {
      return json<ActionData>({
        error: "Ups! No puedo entender ese enunciado. Probá con otro",
      });
    }

    let [steps, suggestions] = await Promise.all([
      fetch(`${process.env.PROFEBOT_API}/exercise-resolution`, {
        method: "POST",
        body: JSON.stringify({
          exercise: result.result.expression,
          exerciseTag: result.result.tag
        }),
        headers: {
          "Content-Type": "application/json"
        }
      }),
      fetch(`${process.env.PROFEBOT_API}/suggestions`, {
        method: "POST",
        body: JSON.stringify({ exercise: result.result.expression }),
        headers: {
          "Content-Type": "application/json"
        }
      })
    ]);
    if (steps.status !== 200) {
      throw new Error("Error en la llamada de /steps");
    }
    let suggestions_ = await suggestions.json();
    let steps_ = await steps.json();
    console.log(steps_);
    return json<ActionData>({
      result: result.result.expression || "",
      steps: steps_ as MathStep[],
      suggestions: suggestions_ as string[],
      text,
      type: result.result.tag as unknown as Tag,
    });
  } catch(error) {
    console.log(error);
    return json<ActionData>({
      error: "Ups! Algo falló, inténtalo nuevamente",
      result: result.result.expression,
      type: result.result.tag
    });
  }
};

let tipos = {
  "Function": "función",
  "Equation": "ecuación"
};

type Steps = "first" | "steps" | "suggestions" | "function"

interface StepProps {
  hide: boolean;
  order: number;
  step: MathStep;
  onClick: () => void;
  isNext: boolean;
}

function Step({ hide, step, onClick, order, isNext }: StepProps) {
  const element = useRef<HTMLDivElement>(null);
  const [showMore, setShowMore] = useState(false);
  useEffect(() => {
    if (!hide && element?.current) {
      element.current.scrollIntoView({
        behavior: "smooth"
      }
      );
    }
  }, [hide, element]);

  if (hide) {
    return (
      <div
        className="border-white border-l gap-8 items-center w-full wrap overflow-hidden p-5 md:p-10 h-full flex md:ml-5 ml-3">
        <div className="z-10 flex items-center bg-white shadow-xl rounded-full absolute md:left-1 -left-[0.1rem]">
          <p className="mx-auto font-semibold text-md md:text-lg text-neutral-900 md:w-8 md:h-8 w-7 h-7 flex items-center justify-center">
            {order}
          </p>
        </div>
        <button
          className="w-full flex w-full blur"
          onClick={onClick}
        >
          <div className="flex-1 bg-white rounded-lg shadow-xl md:px-6 md:py-4 px-4 py-2">
            <p className="mb-3 font-bold text-neutral-900 text-md flex-1">{step.option}</p>
            <p className="text-sm leading-snug tracking-wide text-neutral-900">
              {step.equationOptions?.map(option => showEquationOption(option))}
            </p>
            {step.info && !showMore &&
              <div className="flex md:mt-3 mt-2 gap-2 md:gap-2.5">
                <img src={infoIcon} alt="information" className="w-4 h-4 my-auto"/>
                <p className="text-xs underline text-neutral-800 cursor-pointer">Ver más</p>
              </div>
            }
          </div>
        </button>
        {isNext &&
          <button
            onClick={onClick}
            className="md:text-base text-sm absolute rounded-lg font-bold md:p-4 p-3 bg-indigo-500 hover:bg-indigo-600"
            style={{ left: "calc(50% - 60px)" }}>
            Siguiente paso
          </button>
        }
      </div>
    );
  }
  return (
    <div ref={element}
      className="border-white border-l gap-8 items-center w-full wrap p-5 md:p-10 h-full flex md:ml-5 ml-3">
      <div className="z-10 flex items-center bg-white shadow-xl rounded-full absolute md:left-1 -left-[0.1rem]">
        <p className="mx-auto font-semibold text-md md:text-lg text-neutral-900 md:w-8 md:h-8 w-7 h-7 flex items-center justify-center">
          {order}
        </p>
      </div>
      <div className="w-full flex">
        <div className="flex-1 bg-white rounded-lg shadow-xl md:px-6 md:py-4 px-4 py-2">
          <div className="flex items-center gap-2 md:gap-2.5 md:mb-3 mb-2">
            <p className="font-bold text-neutral-900 text-md flex-1">{step.option}</p>
          </div>
          <p className="text-sm leading-snug tracking-wide text-neutral-900">
            {step.equationOptions?.map(option => showEquationOption(option))}
          </p>
          {step.info && !showMore &&
            <button className="flex md:mt-3 mt-2 gap-2 md:gap-2.5" onClick={() => setShowMore(true)}>
              <img src={infoIcon} alt="information" className="w-4 h-4 my-auto"/>
              <p className="text-xs underline text-neutral-800 cursor-pointer">Ver más</p>
            </button>
          }
          {showMore &&
            <div className="md:mt-3 mt-2 space-y-2">
              <button className="flex gap-2" onClick={() => setShowMore(false)}>
                <img src={infoIcon} alt="information" className="w-4 h-4 my-auto"/>
                <p className="text-xs underline text-neutral-800 cursor-pointer">Ver menos</p>
              </button>
              <p className="text-xs text-neutral-800">{step.info}</p>
            </div>
          }
        </div>
      </div>
    </div>
  );
}

function showEquationOption({ content, equationOptionType }: {content: string, equationOptionType: "TEXT" | "LATEX"}) {
  if (equationOptionType === "TEXT") {
    return content;
  }
  return <Latex key={content}>{`$${content}$`}</Latex>;
}

interface FunctionSteProps {
  order: number;
  step: MathStep;
}

function FunctionStep({ step, order }: FunctionSteProps) {
  const element = useRef<HTMLDivElement>(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (order === 0) {
      if (element?.current) {
        element.current.scrollIntoView({
          behavior: "smooth"
        }
        );
      }
    }
  }, [element, order]);
  return (
    <div ref={element}
      className="border-white border-l gap-8 items-center w-full wrap p-5 md:p-10 h-full flex md:ml-5 ml-3">
      <div className="z-10 flex items-center bg-white shadow-xl rounded-full absolute md:left-1 -left-[0.1rem]">
        <span className="mx-auto font-semibold text-md md:text-lg text-neutral-900 md:w-8 md:h-8 w-7 h-7 flex items-center justify-center">
          &#10140;
        </span>
      </div>
      <div className="w-full flex">
        <div className="flex-1 bg-white rounded-lg shadow-xl md:px-6 md:py-4 px-4 py-2">
          <p className="font-bold text-neutral-900 text-md md:mb-3 mb-2">{step.option}</p>
          <p className="text-sm leading-snug tracking-wide text-neutral-900">
            {step.equationOptions?.map(option => showEquationOption(option))}
          </p>
          {step.info && !showMore &&
            <button className="flex md:mt-3 mt-2 gap-2 md:gap-2.5" onClick={() => setShowMore(true)}>
              <img src={infoIcon} alt="information" className="w-4 h-4 my-auto"/>
              <p className="text-xs underline text-neutral-800 cursor-pointer">Ver más</p>
            </button>
          }
          {showMore &&
            <div className="md:mt-3 mt-2 space-y-2">
              <button className="flex gap-2" onClick={() => setShowMore(false)}>
                <img src={infoIcon} alt="information" className="w-4 h-4 my-auto"/>
                <p className="text-xs underline text-neutral-800 cursor-pointer">Ver menos</p>
              </button>
              <p className="text-xs text-neutral-800">{step.info}</p>
            </div>
          }
        </div>
      </div>
    </div>
  );
}

function Button({ text, onClick }: {text: string; onClick(): void}) {
  return (
    <button
      type="submit"
      onClick={onClick}
      className="w-full font-bold block w-full md:px-6 md:py-4 px-4 py-2 rounded-md shadow bg-indigo-500 font-medium hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 focus:ring-offset-gray-900"
    >
      {text}
    </button>
  );
}

export default function Index() {
  const transition = useTransition();
  const data = useActionData<ActionData>();
  const { defaultText, url } = useLoaderData<LoaderData>();
  const [hasLinkCopied, setHasLinkCopied] = useState(false);
  const [step, setStep] = useState<Steps>("first");
  const [stepByStep, setStepByStep] = useState<number>(0);
  const isFunction = data?.type === "Function";
  const offerSuggestions = step === "steps" && data?.steps?.length && stepByStep === data?.steps?.length - 1;

  useEffect(() => {
    if (!hasLinkCopied) return;
    const timer = setTimeout(() => { setHasLinkCopied(false); }, 2000);
    return () => clearTimeout(timer);
  }, [hasLinkCopied]);

  function nextStep() {
    if (offerSuggestions) {
      // estoy en el ultimo step, voy a suggestions
      setStep("suggestions");
    }
    setStepByStep(prev => prev + 1);
  }
  useEffect(() => {
    setHasLinkCopied(false);
  }, [data?.result]);

  useEffect(() => {
    if (!data?.text) return;
    let history = JSON.parse(localStorage.getItem("ejercicios") || "[]");
    // si el elemento ya existe moverlo de lugar al ultimo
    let index = history.indexOf(data?.text);
    if (index !== -1) {
      // muevo el elemento al final de la lista
      history.push(history.splice(index, 1)[0]);
      localStorage.setItem("ejercicios", JSON.stringify(history));
      return;
    }
    // me aseguro que hayan como mucho 5 enunciados
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
      <h1 className="text-2xl md:text-3xl font-bold text-center">
        <span className="mr-2">&#128221;</span>
        Ingresá el enunciado matemático
      </h1>
      <Form method="post">
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
              className="overflow-auto resize-y block w-full md:px-6 md:py-4 px-4 py-2 rounded-md border-0 text-base text-neutral-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 focus:ring-offset-gray-900"
            />
          </div>
          <div className="mt-4">
            <Button
              text={transition.state === "submitting"
                ? "Calculando..."
                : "Calcular"}
              onClick={() => setStep("first")}
            />
          </div>
        </div>
      </Form>
      {!!data?.result && (
        <div className="font-medium space-y-2 bg-white rounded-lg shadow-xl md:px-6 md:py-4 px-4 py-2">
          <p className="text-md font-bold text-neutral-900">
            <Latex>
              {isFunction ? `$f(x) = ${data.result}$` : `$${data.result}$`}
            </Latex>
          </p>
        </div>
      )}
      {!!data?.error && (
        <div className="font-medium space-y-2">
          <p className="text-xl font-bold">{data?.result && data?.type ? `Ups! No podemos resolver el paso a paso, pero sabemos la expresión y que se trata de una ${tipos[data.type]}` : data.error}</p>
        </div>
      )}
      {!!data?.result && !data?.error &&
        <Button
          text={isFunction ? "Ver análisis de la función" : "Ver paso a paso"}
          onClick={() => {
            setStep(isFunction ? "function" : "steps");
            setStepByStep(0);
          }}
        />
      }
      {/* timeline */}
      {["steps", "suggestions"].includes(step) && !isFunction && <>
        <ul className="container mx-auto w-full h-full relative">
          {data?.steps?.map((s: MathStep, index: number) =>
            <li key={`${s.option} ${index}`}>
              <Step hide={stepByStep < index} order={index + 1} step={s} onClick={nextStep} isNext={stepByStep === (index - 1)}/>
            </li>
          )}
        </ul>
        {(offerSuggestions || step === "suggestions") &&
          <Button
            text="Ver ejercicios parecidos"
            onClick={() => setStep("suggestions")}
          />
        }
      </>
      }
      {/* Caso funciones */}
      {["function", "suggestions"].includes(step) && isFunction && <>
        <ul className="container mx-auto w-full h-full relative">
          {data?.steps?.map((s: MathStep, index: number) => {
            return (
              <li key={`${s.option} ${index}`}>
                <FunctionStep order={index} step={s}/>
              </li>
            );
          })}
        </ul>
        <Button
          text="Ver ejercicios parecidos"
          onClick={() => setStep("suggestions")}
        />
      </>
      }
      {step === "suggestions" && <div>Sugerencias</div>}
      {!!data?.result && !data?.error &&
        <div className="flex flex-col md:flex-row gap-3 md:items-center items-start">
          <button
            className="justify-center rounded-lg text-sm md:p-3 p-2 bg-teal-600 hover:bg-teal-700 flex flex-row gap-2 items-center md:w-fit w-full"
            onClick={async () => {
              const link = `${url}?text=${encodeURIComponent(data?.text?.replace("+", "%2B") || "")}`;
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
            <p>Copia el link al ejercicio y compartilo!</p>
          </button>
          <div className={`bg-green-50 border-l-8 border-green-500 p-3 w-fit rounded-md transition-opacity ${hasLinkCopied ? "opacity-100" : "opacity-0"}`}>
            <p className="text-green-900 text-sm font-bold">Copiado!</p>
          </div>
        </div>
      }
    </>
  );
}
