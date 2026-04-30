// src/hooks/useAuth.ts
// Hook que observa o estado de autenticação do Firebase em tempo real.
// Qualquer componente que precise saber se o usuário está logado usa esse hook.
//
// Por que usar um hook em vez de chamar getAuth() diretamente?
// Porque o Firebase Auth é assíncrono na inicialização — o app pode renderizar
// antes de saber se há um usuário logado. Esse hook gerencia esse estado de
// carregamento automaticamente, evitando flashes de "não autenticado".

"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import type { Usuario } from "@/types";

interface UseAuthRetorno {
  usuario: Usuario | null;
  carregando: boolean;
}

export function useAuth(): UseAuthRetorno {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    // onAuthStateChanged retorna uma função de "unsubscribe"
    // que cancelamos quando o componente é desmontado.
    const cancelarObservador = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUsuario({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          nome: firebaseUser.displayName,
          fotoURL: firebaseUser.photoURL,
        });
      } else {
        setUsuario(null);
      }
      setCarregando(false);
    });

    return () => cancelarObservador();
  }, []);

  return { usuario, carregando };
}
