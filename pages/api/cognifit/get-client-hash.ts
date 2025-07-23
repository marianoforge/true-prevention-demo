import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const clientHash = process.env.COGNIFIT_CLIENT_HASH;

    if (!clientHash) {
      throw new Error("COGNIFIT_CLIENT_HASH not configured on server");
    }

    console.log("🔐 Proporcionando CLIENT_HASH fijo para juegos");

    // Devolver el CLIENT_HASH fijo (como lo muestra el tutorial de CogniFit)
    return res.status(200).json({
      clientHash: clientHash,
    });
  } catch (error) {
    console.error("❌ Error obteniendo CLIENT_HASH:", error);

    return res.status(500).json({
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : "Error desconocido",
    });
  }
}
