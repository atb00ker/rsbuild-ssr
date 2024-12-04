import { Request, Response } from "express";

export type Renderer = { render: (path: string) => string };
export type ServerAPI = {
  environments: {
    ssr: {
      loadBundle: (name: string) => Promise<Renderer>;
    };
    web: {
      getTransformedHtml: (name: string) => Promise<string>;
    };
  };
};

export type ServerRenderProps = {
  url: string;
  request: Request;
  response: Response;
};

export type ServerRender = ({
  url,
  request,
  response,
}: ServerRenderProps) => void;

enum CacheLocation {
  Home = "/",
}
