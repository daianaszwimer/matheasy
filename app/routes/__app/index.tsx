import { Form, Link, useActionData, useFetcher, useLoaderData, useLocation, useTransition } from "@remix-run/react";
import { json } from "@remix-run/node";
import type {  ActionFunction , LoaderFunction } from "@remix-run/node";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import styles from "katex/dist/katex.min.css";
import Latex from "react-latex-next";
import linkIcon from "~/assets/link.svg";
import infoIcon from "~/assets/info.svg";
import keyboardIcon from "~/assets/keyboard.svg";
import resetIcon from "~/assets/reset.svg";

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
  steps?: MathStep[] | null;
  suggestions?: string[] | null;
  text: string;
  type?: Tag | null;
  status?: string | null;
}

interface LoaderData {
  defaultText?: string;
  url: string;
  autoResolve: boolean;
}

export function links() {
  return [
    { rel: "stylesheet", href: styles }
  ];
}

export const loader: LoaderFunction = async ({
  request
}) => {
  const url = new URL(request.url);
  const autoResolve = url.searchParams.has("h");
  try {
    const defaultText = decodeURIComponent(url.searchParams.get("text") || "");
    // si venis de historial se resuelve automatico
    return json<LoaderData>({
      defaultText,
      url: process.env.WEB_URL || "",
      autoResolve
    });
  } catch (error) {
    return json<LoaderData>({
      defaultText: "",
      url: process.env.WEB_URL || "",
      autoResolve
    });
  }
};

const INVALID_TEXT_ERROR = "300";

export const action: ActionFunction = async({ request }) => {
  const body = await request.formData();
  const text = body.get("problem") as string;
  try {
    const mathExpression = await getExpression(text);
    if (mathExpression === null) {
      throw new Error("Falla en traduccion");
    }
    if (mathExpression.error === INVALID_TEXT_ERROR) {
      throw new Error(INVALID_TEXT_ERROR);
    }
    let [steps, suggestions] = await Promise.all([
      getResolution(mathExpression.expression, mathExpression.tag),
      getSuggestions(mathExpression.expression, mathExpression.tag)
    ]);

    return json<ActionData>({
      result: mathExpression?.expression || null,
      steps: steps ? steps as MathStep[] : null,
      suggestions: suggestions ? suggestions as string[] : null,
      text,
      type: mathExpression ? mathExpression.tag as Tag : null
    });
  } catch(error) {
    console.log(error);
    let status = null;
    if (error instanceof Error) {
      status = error.message;
    }
    return json<ActionData>({
      error: "¡Ups! Algo falló, inténtalo nuevamente",
      text,
      status
    });
  }
  async function getExpression(text: string) {
    try {
      const expression = await fetch(
        `${process.env.API_URL}/math-translation`,
        {
          method: "POST",
          body: JSON.stringify({ text }),
          headers: {
            "Content-Type": "application/json"
          }
        });
      if (expression.status === 400) {
        throw new Error(INVALID_TEXT_ERROR);
      }
      if (expression.status !== 200) {
        throw new Error("Status no es 200");
      }
      const response = await expression.json();
      // retorna { expression, tag }
      return response.result;
    } catch (error) {
      // @ts-ignore
      if (error.message === INVALID_TEXT_ERROR) {
        return { error: INVALID_TEXT_ERROR };
      }
      console.log("Fallo /math-translation", error);
      return null;
    }
  }
  async function getResolution(expression: string, tag: string) {
    try {
      const response = await
      fetch(`${process.env.PROFEBOT_API}/exercise-resolution`, {
        method: "POST",
        body: JSON.stringify({
          exercise: expression,
          exerciseTag: tag
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });
      if (response.status !== 200) {
        throw new Error("Status no es 200");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.log("Fallo /exercise-resolution", error);
      return null;
    }
  }
  async function getSuggestions(expression: string, tag: string) {
    try {
      const response = await fetch(
        `${process.env.API_URL}/suggestions`,
        {
          method: "POST",
          body: JSON.stringify({ equation: expression, tag }),
          headers: {
            "Content-Type": "application/json"
          }
        });
      if (response.status !== 200) {
        throw new Error("Status no es 200");
      }
      const result = await response.json();
      return result;
    } catch (error) {
      console.log("Fallo /suggestions", error);
      return null;
    }
  }
};

type Steps = "steps" | "suggestions" | "function"

interface StepProps {
  hide: boolean;
  order: number;
  step: MathStep;
  onClick: () => void;
  isNext: boolean;
  showAll: () => void;
  isLast: boolean;
}

function Step(
  { hide, step, onClick, order, isNext, showAll, isLast }
    : StepProps) {
  const element = useRef<HTMLDivElement>(null);
  const [showMore, setShowMore] = useState(false);
  useEffect(() => {
    if (!hide && element?.current) {
      element.current.scrollIntoView({
        behavior: "smooth"
      });
    }
  }, [hide, element]);

  if (hide) {
    return (
      <div
        className="border-white border-l gap-8 items-center w-full wrap overflow-hidden p-5 md:p-10 h-full flex md:ml-5 ml-3"
      >
        <div className="z-10 flex items-center bg-white shadow-xl rounded-full absolute md:left-1 -left-[0.1rem]">
          <p className="mx-auto font-bold text-base md:text-lg text-neutral-900 md:w-8 md:h-8 w-7 h-7 flex items-center justify-center">
            {order}
          </p>
        </div>
        <div
          className="w-full flex blur select-none"
          aria-hidden
        >
          <div className="font-['computer'] flex-1 bg-white rounded-lg shadow-xl md:px-6 md:py-4 px-4 py-2 text-base md:text-lg">
            <p className="mb-3 text-neutral-900 flex-1">{step.option}</p>
            <p className="leading-snug tracking-wide text-neutral-900">
              {step.equationOptions?.map(
                (option) =>
                  <Fragment key={option.content}>
                    {showEquationOption(option)}
                  </Fragment>
              )}
            </p>
            {step.info && !showMore &&
              <div className="flex md:mt-3 mt-2 gap-1.5">
                <img src={infoIcon} alt="information" className="w-3 h-3 my-auto"/>
                <p className="text-sm underline text-neutral-800">Ver más</p>
              </div>
            }
          </div>
        </div>
        {isNext &&
          <div className="flex gap-3 absolute justify-center md:w-[calc(100%_-_82px)] w-[calc(100%_-_41px)]">
            <button
              aria-label="Ir al siguiente paso"
              onClick={onClick}
              className="md:text-base text-sm rounded-lg md:p-4 p-3 bg-indigo-500 hover:bg-indigo-600"
            >
              {order === 1 ? "Primer paso" : isLast ? "Último paso" : "Siguiente paso"}
            </button>
            {!isLast && <button
              aria-label="Mostrar todos los pasos"
              onClick={showAll}
              className="md:text-base text-sm rounded-lg md:p-4 p-3 bg-gray-900 hover:bg-black"
            >
              Saltear pasos
            </button>}
          </div>
        }
      </div>
    );
  }
  return (
    <div ref={element}
      className="border-white border-l gap-8 items-center w-full wrap p-5 md:p-10 h-full flex md:ml-5 ml-3">
      <div className="z-10 flex items-center bg-white shadow-xl rounded-full absolute md:left-1 -left-[0.1rem]">
        <p className="mx-auto font-bold text-base md:text-lg text-neutral-900 md:w-8 md:h-8 w-7 h-7 flex items-center justify-center">
          {order}
        </p>
      </div>
      <div className="w-full flex text-base md:text-lg">
        <div className="font-['computer'] flex-1 bg-white rounded-lg shadow-xl md:px-6 md:py-4 px-4 py-2">
          <div className="flex items-center gap-1.5 md:mb-3 mb-2">
            <p className="text-neutral-900 flex-1">{step.option}</p>
          </div>
          <p className="leading-snug tracking-wide text-neutral-900">
            {step.equationOptions?.map(
              (option) => <Fragment key={option.content}>
                {showEquationOption(option)}
              </Fragment>
            )}
          </p>
          {step.info && !showMore &&
            <button className="flex md:mt-3 mt-2 gap-1.5" onClick={() => setShowMore(true)}>
              <img src={infoIcon} alt="information" className="w-3 h-3 my-auto"/>
              <p className="text-sm underline text-neutral-800 cursor-pointer">Ver más</p>
            </button>
          }
          {showMore &&
            <div className="md:mt-3 mt-2 space-y-2">
              <button className="flex gap-2" onClick={() => setShowMore(false)}>
                <img src={infoIcon} alt="information" className="w-3 h-3 my-auto"/>
                <p className="text-sm underline text-neutral-800 cursor-pointer">Ver menos</p>
              </button>
              <p className="text-sm text-neutral-800">{step.info}</p>
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
  return <>
    <span className="inline-block" aria-hidden><Latex key={content}>{`$${content}$`}</Latex></span>
    <span className="sr-only">{content}</span>
  </>;
}

interface FunctionSteProps {
  order: number;
  step: MathStep;
}

function FunctionStep({ step }: FunctionSteProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div
      className="font-['computer'] border-white border-l gap-8 items-center w-full wrap p-5 md:p-10 h-full flex md:ml-5 ml-3">
      <div aria-hidden className="z-10 flex items-center bg-white shadow-xl rounded-full absolute md:left-1 -left-[0.1rem]">
        <span className="mx-auto font-bold text-base md:text-lg text-neutral-900 md:w-8 md:h-8 w-7 h-7 flex items-center justify-center">
          &#10140;
        </span>
      </div>
      <div className="w-full flex">
        <div className="flex-1 bg-white rounded-lg shadow-xl md:px-6 md:py-4 px-4 py-2 text-base md:text-lg">
          <p className="text-neutral-900 md:mb-3 mb-2">{step.option}</p>
          <p className="leading-snug tracking-wide text-neutral-900">
            {step.equationOptions?.map(
              (option) => <Fragment key={option.content}>
                {showEquationOption(option)}
              </Fragment>
            )}
          </p>
          {step.info && !showMore &&
            <button className="flex md:mt-3 mt-2 gap-1.5" onClick={() => setShowMore(true)}>
              <img src={infoIcon} alt="information" className="w-3 h-3 my-auto"/>
              <p className="text-sm underline text-neutral-800 cursor-pointer">Ver más</p>
            </button>
          }
          {showMore &&
            <div className="md:mt-3 mt-2 space-y-2">
              <button className="flex gap-2" onClick={() => setShowMore(false)}>
                <img src={infoIcon} alt="information" className="w-3 h-3 my-auto"/>
                <p className="text-sm underline text-neutral-800 cursor-pointer">Ver menos</p>
              </button>
              <p className="text-sm text-neutral-800">{step.info}</p>
            </div>
          }
        </div>
      </div>
    </div>
  );
}

function Button(
  { text, disabled, type, onClick = () => {} }:
    {text: string, disabled: boolean, type?: string, onClick?: () => void}) {
  if (type === "button") {
    return (
      <button
        disabled={disabled}
        type="button"
        className="w-full font-bold block w-full md:px-6 md:py-4 px-4 py-2 rounded-md shadow bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300 focus:ring-offset-gray-900"
        onClick={onClick}
      >
        {text}
      </button>
    );
  }
  return (
    <button
      disabled={disabled}
      type="submit"
      className={`w-full font-bold block w-full md:px-6 md:py-4
      px-4 py-2 rounded-md shadow bg-indigo-500
      hover:bg-indigo-600 focus:outline-none
      focus:ring-2 focus:ring-offset-2 focus:ring-indigo-300
      focus:ring-offset-gray-900
      ${disabled ? "bg-indigo-400 hover:bg-indigo-400" : ""}`}
    >
      {text}
    </button>
  );
}

function encodeText(text?: string) {
  return encodeURIComponent(text?.replaceAll("%", "%25").replaceAll("+", "%2B").replaceAll("=", "%3D") || "");
}

function OperationButton({
  text,
  operator,
  onClick,
  title
}: {
  text: string,
  operator: string,
  onClick:(operator: string) => void
  title: string
}) {
  function onSelect() {
    onClick(operator);
  }
  return (
    <button
      title={title}
      onClick={onSelect}
      aria-label={title}
      type="button"
      className="bg-white
      text-black p-1 md:p-3 rounded-md flex items-center justify-center"
    >
      <Latex>{`$${text}$`}</Latex>
    </button>
  );
}

function StepsError({ type }: {type: Tag}) {
  if (type === "Function") {
    return (
      <>
        ¡Ups! No puedo analizar esta función{" "}
        <span aria-hidden>&#128546;</span>
      </>
    );
  }
  return <>
    ¡Ups! No puedo resolver esta ecuación{" "}
    <span aria-hidden>&#128546;</span>
  </>;
}

export function ErrorBoundary() {
  //const caught = useCatch();
  return (
    <div className="font-light text-xl flex flex-col items-center space-y-1">
      <p>¡Ups! Algo falló</p>
      <p>No te preocupes, no es tu culpa!</p>
      <Link to="/" className="underline font-medium" reloadDocument>Volver al Inicio</Link>
    </div>
  );
}

export default function Index() {
  const transition = useTransition();
  const data = useActionData<ActionData>();
  const { defaultText, url, autoResolve } = useLoaderData<LoaderData>();
  const [text, setText] = useState<string>(defaultText || "");
  const operator = useRef(0);
  const [hasLinkCopied, setHasLinkCopied] = useState(false);
  const [step, setStep] = useState<Steps | "">("");
  const calculator = useRef<HTMLDivElement>(null);
  const [stepByStep, setStepByStep] = useState<number>(0);
  const [showOperators, setShowOperators] = useState<boolean>(true);
  const textArea = useRef<HTMLTextAreaElement>(null);
  const location = useLocation();
  const fetcher = useFetcher();
  let response = data || fetcher.data;
  const isFunction = response?.type === "Function";
  const offerSuggestions = step === "steps" && response?.steps?.length && stepByStep === response?.steps?.length - 1;
  const [mark, setMark] = useState(false);
  const graph = useMemo(() => {
    if (!calculator?.current) return;
    // @ts-ignore
    return window.Desmos.GraphingCalculator(calculator.current, { expressionsCollapsed: true, language: "es" });
  }, [calculator, calculator?.current]);

  useEffect(() => {
    if (mark || !autoResolve) return;
    setMark(true);
    fetcher.submit(
      { problem: defaultText || "" },
      { method: "post", action: `${location.pathname}${location.search ? location.search : "?index"}` }
    );
  }, [
    autoResolve,
    defaultText,
    fetcher,
    location,
    mark
  ]);
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
    setStepByStep((prev) => prev + 1);
  }

  useEffect(() => {
    if (!response?.result) return;
    setStep(isFunction ? "function" : "steps");
    setStepByStep(-1);
  }, [response?.result, response?.error, isFunction, calculator]);

  useEffect(() => {
    if ("function" !== step || !response?.result || !graph) {
      return;
    }
    graph.setExpression({ id: "graph", latex: `f(x) = ${response.result}` });
  }, [calculator, step, response?.result, graph]);

  useEffect(() => {
    if (response?.error || !response?.text) return;
    let history = JSON.parse(localStorage.getItem("ejercicios") || "[]");
    // si el elemento ya existe moverlo de lugar al ultimo
    let index = history.indexOf(response?.text);
    if (index !== -1) {
      // muevo el elemento al final de la lista
      history.push(history.splice(index, 1)[0]);
      localStorage.setItem("ejercicios", JSON.stringify(history));
      return;
    }
    // me aseguro que hayan como mucho 10 enunciados
    if (history.length < 10) {
      history.push(response?.text);
    } else {
      history.shift();
      history.push(response?.text);
    }
    localStorage.setItem("ejercicios", JSON.stringify(history));
  }, [response?.error, response?.text]);

  useEffect(() => {
    if (operator.current) {
      textArea.current?.setSelectionRange(
        operator.current,
        operator.current);
      textArea?.current?.focus();
      operator.current = 0;
    }
  }, [text]);

  function addOperator(_operator: string) {
    let position = textArea.current?.selectionStart || 0;
    setText(prev => [prev.slice(0, position), _operator, prev.slice(position)].join(""));
    operator.current = _operator.length + position;
  }

  function toggleShowOperators() {
    setShowOperators(prev => !prev);
  }

  let errorTranslation = response?.status &&
    response?.status !== INVALID_TEXT_ERROR;

  let invalidText = response?.status === INVALID_TEXT_ERROR;

  let classError = "focus:ring-2 focus:ring-offset-1 focus:ring-rose-300 ring ring-offset-1 ring-rose-700 focus:ring-offset-gray-900";

  let textAreaClass = `min-h-fit overflow-auto resize-y block w-full md:px-6 md:py-4 px-4 py-2 rounded-md border-0 text-base text-neutral-900 placeholder-neutral-400 focus:outline-none ${invalidText && defaultText === text ? classError : "focus:ring-offset-1 focus:ring-2 focus:ring-indigo-300 focus:ring-offset-gray-900"}`;

  return (
    <>
      <h1 className="text-2xl md:text-3xl text-center">
        <span className="mr-2" aria-hidden>&#128221;</span>
        Resolvé un ejercicio
      </h1>
      <Form method="post" action={`${location.pathname}?index&text=${encodeText(text)}`}>
        <div className="flex-col h-full w-full mx-auto space-y-3">
          <div className="space-y-2 text-lg">
            <label htmlFor="problem">
              Ingresá el enunciado matemático
            </label>
            <div className="relative">
              <textarea
                ref={textArea}
                disabled={transition.state !== "idle" || fetcher.state !== "idle"}
                id="problem"
                name="problem"
                value={text}
                onChange={(event) => {setText(event.target.value);}}
                required
                placeholder="Despejar x de la siguiente ecuación: x + 8 = 9"
                className={textAreaClass}
                spellCheck
              />
              {text !== "" &&
                <button
                  type="button"
                  onClick={() => setText("")}
                  title="Borrar texto"
                  className="absolute top-2 right-2"
                >
                  <img alt="" className="w-5 h-5" src={resetIcon}/>
                </button>
              }
            </div>
            {invalidText && (
              <div className="text-base font-light space-y-2">
                <p>
                  El enunciado ingresado no es válido.
                </p>
                <p>
                  Si querés saber qué enunciados son válidos podés{" "}
                  <Link target="_blank" to="/faq#tipo-enunciados" className="underline">
                    leer ejemplos en la sección de ayuda
                  </Link>
                </p>
              </div>
            )}
            <div className="flex justify-between items-center">
              <button
                type="button"
                className="text-sm underline text-neutral-300 flex items-center gap-2"
                onClick={toggleShowOperators}
              >
                {showOperators ? "Ocultar" : "Mostrar"} teclado <img alt="" className="w-6 h-6" src={keyboardIcon}/>
              </button>
            </div>
            {showOperators && (
              <div className="grid gap-2 md:grid-rows-1 grid-rows-2 grid-flow-col md:auto-cols-auto">
                <OperationButton text="x" operator="x" onClick={addOperator} title="Incógnita"/>
                <OperationButton text="=" operator=" = " onClick={addOperator} title="Igualdad"/>
                <OperationButton text="+" operator=" + " onClick={addOperator} title="Suma"/>
                <OperationButton text="-" operator=" - " onClick={addOperator} title="Resta"/>
                <OperationButton text="\times" operator=" * " onClick={addOperator} title="Multiplicación"/>
                <OperationButton text="\div" operator=" / " onClick={addOperator} title="División"/>
                <OperationButton text=">" operator=" > " onClick={addOperator} title="Mayor"/>
                <OperationButton text="<" operator=" < " onClick={addOperator} title="Menor"/>
                <OperationButton text="\geq" operator=" >= " onClick={addOperator} title="Mayor igual"/>
                <OperationButton text="\leq" operator=" <= " onClick={addOperator} title="Menor igual"/>
                <OperationButton text="(" operator=" ( " onClick={addOperator} title="Abrir paréntesis"/>
                <OperationButton text=")" operator=" ) " onClick={addOperator} title="Cerrar paréntesis"/>
                <OperationButton text="a^2" operator=" ^2 " onClick={addOperator} title="Cuadrado"/>
                <OperationButton text="a^b" operator=" ^ " onClick={addOperator} title="Potencia"/>
              </div>
            )}
          </div>
          <Button
            disabled={transition.state !== "idle" ||
              fetcher.state !== "idle"
              // no dejar hacer submit si el texto es el mismo y es error
              || (defaultText === text && invalidText)}
            text={transition.state !== "idle" || fetcher.state !== "idle"
              ? "Calculando..."
              : "Calcular"}
          />
        </div>
      </Form>
      {errorTranslation && (
        <div className="text-lg font-light">
          <p>
            ¡Ups! No pude armar la expresión matemática. Por favor intentá con otro enunciado{" "}
            <span aria-hidden>&#128546;</span>
          </p>
          <p>Podés resolver tus dudas leyendo{" "}
            <Link target="_blank" to="/faq#tipo-enunciados" className="underline">
              ejemplos de enunciados
            </Link>
          </p>
        </div>
      )}
      {!!response?.result && (
        <div className="space-y-2 text-lg">
          <p>
            La expresión matemática es
          </p>
          <div className="font-medium bg-white rounded-lg shadow-xl md:px-6 md:py-4 px-4 py-2">
            <p className="text-neutral-900" aria-hidden>
              <Latex>
                {isFunction ?
                  `$f(x) = ${response.result}$` : `$${response.result}$`}
              </Latex>
            </p>
            <p className="sr-only">
              {isFunction ?
                `f(x) = ${response.result}` : response.result}
            </p>
          </div>
        </div>
      )}
      {/* timeline */}
      {["steps", "suggestions"].includes(step) && !isFunction && response?.steps?.length > 0 &&
        (
          <div className="space-y-3">
            <p className="text-lg">Los pasos para resolverla son</p>
            <Link target="_blank" to="/faq#pasos" className="text-sm underline text-neutral-300">
              ¿Necesitás ayuda?
            </Link>
            <ul className="container mx-auto w-full h-full relative">
              {response?.steps?.map((s: MathStep, index: number) =>
                <li key={`${s.option} ${index}`}>
                  <Step
                    hide={stepByStep < index}
                    order={index + 1}
                    step={s}
                    onClick={nextStep}
                    isNext={stepByStep === (index - 1)}
                    isLast={index === response?.steps?.length - 1}
                    showAll={() => setStepByStep(
                      response?.steps?.length - 1 || 0
                    )}
                  />
                </li>
              )}
            </ul>
          </div>
        )
      }
      {/* Caso funciones */}
      {["function", "suggestions"].includes(step) && isFunction &&
        (
          <>
            <div ref={calculator} id="calculator" className="md:h-96 h-56" style={{ "width": "100%" }}></div>
            <ul className="container mx-auto w-full h-full relative">
              {response?.steps?.map((s: MathStep, index: number) => {
                return (
                  <li key={`${s.option} ${index}`}>
                    <FunctionStep order={index} step={s}/>
                  </li>
                );
              })}
            </ul>
          </>
        )
      }
      {response?.steps === null &&
        (
          <div className="text-lg font-light">
            <p>
              {response?.result && response?.type ?
                <StepsError type={response.type}/> : response.error
              }
            </p>
            <p>Podés resolver tus dudas leyendo{" "}
              <Link target="_blank" to="/faq#tipo-enunciados" className="underline">
                ejemplos de enunciados
              </Link>
            </p>
          </div>
        )
      }
      {response?.suggestions && ((isFunction || offerSuggestions) || step === "suggestions") &&
        <div className="mt-4">
          <Button
            text="Ver ejercicios parecidos"
            disabled={false}
            type="button"
            onClick={() => setStep("suggestions")}
          />
        </div>
      }
      {response?.suggestions && step === "suggestions" &&
        (
          <div className="space-y-3 text-lg">
            <p>
              Más ejercicios
            </p>
            <ul className="container mx-auto w-full h-full relative">
              {response?.suggestions?.map((suggestion: string) =>
                <li key={suggestion}>
                  <div
                    className="border-white border-l gap-8 items-center w-full wrap p-5 md:p-10 h-full flex md:ml-5 ml-3">
                    <div className="z-10 flex items-center bg-white shadow-xl rounded-full absolute md:left-1 -left-[0.1rem]">
                      <p className="mx-auto font-bold text-base md:text-lg text-neutral-900 md:w-8 md:h-8 w-7 h-7 flex items-center justify-center">
                        &#10140;
                      </p>
                    </div>
                    <div className="w-full flex text-base md:text-lg">
                      <div className="font-['computer'] flex-1 bg-white rounded-lg shadow-xl md:px-6 md:py-4 px-4 py-2">
                        <div className="leading-snug tracking-wide text-neutral-900">
                          <p aria-hidden>
                            <Latex>
                              {`$${suggestion}$`}
                            </Latex>
                          </p>
                          <p className="sr-only">
                            {suggestion}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              )}
            </ul>
          </div>
        )
      }
      {response?.suggestions === null &&
        (
          <div className="text-lg space-y-1 font-light">
            <p>
              ¡Ups! No pude generar ejercicios similares{" "}
              <span aria-hidden>&#128546;</span>
            </p>
            <Link target="_blank" to="/faq" className="underline">
              ¿Necesitás ayuda?
            </Link>
          </div>
        )
      }
      {!!response?.result && !response?.error &&
        <div className="flex flex-col md:flex-row gap-3 md:items-center items-start">
          <button
            aria-label="Copiar link al ejercicio"
            className="font-medium justify-center rounded-lg text-sm md:p-3 p-2 bg-teal-600 hover:bg-teal-700 flex flex-row gap-2 items-center md:w-fit w-full"
            onClick={async () => {
              const link = `${url}?text=${encodeText(response?.text)}`;
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
            <p aria-hidden>¡Copia el link al ejercicio y compartilo!</p>
          </button>
          <div className={`bg-green-50 border-l-8 border-green-500 p-3 w-fit rounded-md transition-opacity ${hasLinkCopied ? "opacity-100" : "opacity-0 invisible"}`}>
            <p className="text-green-900 text-sm font-medium">¡Copiado!</p>
          </div>
        </div>
      }
    </>
  );
}
