declare module "jwk-to-pem" {
  function jwkToPem(
    jwk: Record<string, any>,
    options?: { private: boolean }
  ): string;
  export default jwkToPem;
}
