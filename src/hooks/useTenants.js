"use client";
import { useState, useEffect } from "react";

// Carga la lista de negocios y selecciona el primero por default.
// Compartido por todas las páginas con selector de tenant.
export function useTenants() {
  const [tenants, setTenants] = useState([]);
  const [tenantId, setTenantId] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api/tenants")
      .then((r) => r.json())
      .then((d) => {
        setTenants(d.tenants || []);
        if (d.tenants?.[0]) setTenantId(d.tenants[0].id);
        if (d.error) setError(d.error);
      })
      .catch(() => setError("No se pudo conectar con el servidor."));
  }, []);

  return { tenants, tenantId, setTenantId, error };
}
