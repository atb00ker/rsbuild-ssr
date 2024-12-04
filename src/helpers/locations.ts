import { Application, Request, Response, NextFunction } from "express";
import { ServerRender } from "./types";
import { access } from "node:fs/promises";

export default async function addExpressUrls(
  app: Application,
  callBack: ServerRender,
  errCallBack?: (response: Response) => void
) {
  const ssrUrls = await getSSRUrls();
  ssrUrls.forEach((url) => {
    addExpressUrl(url, app, callBack, errCallBack);
  });
}

function addExpressUrl(
  url: string,
  app: Application,
  callBack: ServerRender,
  errCallBack?: (response: Response) => void
) {
  return app.get(
    url,
    (request: Request, response: Response, next: NextFunction) => {
      try {
        callBack({ url, request, response });
      } catch (err) {
        console.error("SSR render error, downgrading to CSR:");
        console.error(err);

        if (errCallBack) {
          return errCallBack(response);
        }

        next();
      }
    }
  );
}

const configPath = `${process.cwd()}/rsbuild.config.mjs`;

async function getConfig() {
  try {
    const exists = await access(configPath).then(
      () => true,
      () => false
    );
    if (exists) {
      return await import(configPath);
    }
  } catch (err) {
    console.warn("Could not load config:", err);
  }
  return null;
}

export async function getTemplate() {
  const config = await getConfig();
  if (config?.default?.environments?.web?.html?.template) {
    return config.default.environments.web.html.template;
  }

  throw new Error("No template file found in config");
}

async function getSSRUrls(): Promise<string[]> {
  const defaultUrls = ["/"];
  const config = await getConfig();

  if (config?.ssrUrls && Array.isArray(config.ssrUrls)) {
    return config.ssrUrls;
  }

  return defaultUrls;
}
