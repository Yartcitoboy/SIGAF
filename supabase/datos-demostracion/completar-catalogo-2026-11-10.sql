-- COMPLETADO REFERENCIAL DEL CATALOGO PARA VIDEO, autorizado el 10-11-2026.
-- Proyecto: nkqxhpiagkcfvxbytarn. No es una migracion de esquema ni una fuente ISP.
-- INT-ISP-* son identificadores internos. (ref.) identifica contenidos estimados.
-- Conserva nombre, principio activo, registro, titular, fechas y fuente ISP.
-- Las filas anteriores se conservan dentro del manifiesto para auditoria.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';
SELECT pg_advisory_xact_lock(73421111);
LOCK TABLE public.producto IN SHARE ROW EXCLUSIVE MODE;
DO $completar_catalogo$
DECLARE
  v_plan jsonb := $plan_catalogo$
[
  {
    "id_producto": 115,
    "antes": {
      "nombre": "AARBILOL COMPRIMIDOS RECUBIERTOS 50 mg (LOSARTAN POTASICO)",
      "principio_activo": "Losartán Potásico",
      "registro_isp": "F-29673/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000115",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 190,
    "antes": {
      "nombre": "ÁCIDO ACETILSALICILICO/ PARACETAMOL / CAFEINA 250/250/65 COMPRIMIDOS",
      "principio_activo": "ACIDO ACETILSALICILICO;CAFEINA;PARACETAMOL",
      "registro_isp": "F-29353/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000190",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 17,
    "antes": {
      "nombre": "ÁCIDO CLAVULÁNICO/AMOXICILINA 400/57 POLVO PARA SUSPENSIÓN ORAL",
      "principio_activo": "ACIDO CLAVULANICO//AMOXICILINA",
      "registro_isp": "F-26987/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000017",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 66,
    "antes": {
      "nombre": "ACTRONRA CÁPSULAS BLANDAS 200 mg (IBUPROFENO)",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-16002/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000066",
      "unidad_medida": "Caja x 20 capsulas (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 191,
    "antes": {
      "nombre": "ACUPARA SOLUCIÓN PARA PERFUSIÓN 10 mg/mL (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-27865/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000191",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 92,
    "antes": {
      "nombre": "AERIUS JARABE 2,5 mg/5 mL (DESLORATADINA)",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-25404/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000092",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 91,
    "antes": {
      "nombre": "AERIUS SOLUCIÓN ORAL 2,5 mg/5 mL (DESLORATADINA)",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-25405/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000091",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 93,
    "antes": {
      "nombre": "AERIUS SOLUCIÓN ORAL 2,5 mg/5 mL (DESLORATADINA)",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-27318/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000093",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 41,
    "antes": {
      "nombre": "ALERPAST SOLUCIÓN ORAL 2,5 mg/5 mL (LEVOCETIRIZINA DICLORHIDRATO)",
      "principio_activo": "LEVOCETIRIZINA DICLORHIDRATO",
      "registro_isp": "F-30010/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000041",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 42,
    "antes": {
      "nombre": "ALERPAST SOLUCIÓN ORAL 5 mg/5 mL (LEVOCETIRIZINA DICLORHIDRATO)",
      "principio_activo": "LEVOCETIRIZINA DICLORHIDRATO",
      "registro_isp": "F-30005/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000042",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 43,
    "antes": {
      "nombre": "ALERPAST SOLUCIÓN ORAL PARA GOTAS 5 mg/mL (LEVOCETIRIZINA DICLORHIDRATO)",
      "principio_activo": "LEVOCETIRIZINA DICLORHIDRATO",
      "registro_isp": "F-30004/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000043",
      "unidad_medida": "Frasco gotero x 20 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 44,
    "antes": {
      "nombre": "ALERPRIV JARABE 2,5 mg/ 5 mL (LEVOCETIRIZINA DICLORHIDRATO)",
      "principio_activo": "LEVOCETIRIZINA DICLORHIDRATO",
      "registro_isp": "F-22039/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000044",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 45,
    "antes": {
      "nombre": "ALERVION JARABE 5 mg/ 5 mL (LEVOCETIRIZINA)",
      "principio_activo": "LEVOCETIRIZINA",
      "registro_isp": "F-23460/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000045",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 192,
    "antes": {
      "nombre": "ALIVIDOL COMPRIMIDOS 1000 mg (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-29935/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000192",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 193,
    "antes": {
      "nombre": "ALIVIDOL COMPRIMIDOS 500 mg (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-26557/21",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000193",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 194,
    "antes": {
      "nombre": "ALIVIDOL SOLUCIÓN PARA GOTAS ORALES 100 mg/mL (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-26935/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000194",
      "unidad_medida": "Frasco gotero x 20 mL (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 18,
    "antes": {
      "nombre": "AMOBIOTIC BID 1000 POLVO PARA SUSPENSION ORAL 1000 mg/5mL, CON SOLVENTE (AMOXICILINA)",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-22891/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000018",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 19,
    "antes": {
      "nombre": "AMOVAL COMPRIMIDOS DISPERSABLES 1 g (AMOXICILINA)",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-5515/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000019",
      "unidad_medida": "Caja x 21 comp. (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 21,
    "antes": {
      "nombre": "AMOXICILINA / ÁCIDO CLAVULÁNICO 250/62,5 POLVO PARA SUSPENSION ORAL",
      "principio_activo": "ACIDO CLAVULANICO//AMOXICILINA",
      "registro_isp": "F-25932/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000021",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 20,
    "antes": {
      "nombre": "AMOXICILINA / ÁCIDO CLAVULÁNICO 250/62,5 POLVO PARA SUSPENSIÓN ORAL",
      "principio_activo": "ACIDO CLAVULANICO//AMOXICILINA",
      "registro_isp": "F-25559/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000020",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 22,
    "antes": {
      "nombre": "AMOXICILINA / ACIDO CLAVULANICO 500 /125 mg COMPRIMIDOS RECUBIERTOS",
      "principio_activo": "ACIDO CLAVULANICO//AMOXICILINA",
      "registro_isp": "F-23293/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000022",
      "unidad_medida": "Caja x 21 comp. (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 23,
    "antes": {
      "nombre": "AMOXICILINA / ACIDO CLAVULANICO 500/125 COMPRIMIDOS RECUBIERTOS",
      "principio_activo": "ACIDO CLAVULANICO//AMOXICILINA",
      "registro_isp": "F-25980/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000023",
      "unidad_medida": "Caja x 21 comp. (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 24,
    "antes": {
      "nombre": "AMOXICILINA / ÁCIDO CLAVULÁNICO 500/125 COMPRIMIDOS RECUBIERTOS",
      "principio_activo": "ACIDO CLAVULANICO//AMOXICILINA",
      "registro_isp": "F-24048/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000024",
      "unidad_medida": "Caja x 21 comp. (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 25,
    "antes": {
      "nombre": "AMOXICILINA / ÁCIDO CLAVULÁNICO 500/125 COMPRIMIDOS RECUBIERTOS",
      "principio_activo": "ACIDO CLAVULANICO//AMOXICILINA",
      "registro_isp": "F-23184/21",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000025",
      "unidad_medida": "Caja x 21 comp. (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 26,
    "antes": {
      "nombre": "AMOXICILINA / ÁCIDO CLAVULÁNICO 500/125 COMPRIMIDOS RECUBIERTOS",
      "principio_activo": "ACIDO CLAVULANICO//AMOXICILINA",
      "registro_isp": "F-29447/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000026",
      "unidad_medida": "Caja x 21 comp. (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 27,
    "antes": {
      "nombre": "AMOXICILINA / ÁCIDO CLAVULÁNICO 875/125 COMPRIMIDOS RECUBIERTOS",
      "principio_activo": "ACIDO CLAVULANICO//AMOXICILINA",
      "registro_isp": "F-23185/21",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000027",
      "unidad_medida": "Caja x 21 comp. (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 28,
    "antes": {
      "nombre": "AMOXICILINA / ÁCIDO CLAVULÁNICO 875/125 COMPRIMIDOS RECUBIERTOS",
      "principio_activo": "ACIDO CLAVULANICO//AMOXICILINA",
      "registro_isp": "F-28578/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000028",
      "unidad_medida": "Caja x 21 comp. (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 29,
    "antes": {
      "nombre": "AMOXICILINA / ÁCIDO CLAVULÁNICO COMPRIMIDOS RECUBIERTOS 875 / 125",
      "principio_activo": "ACIDO CLAVULANICO//AMOXICILINA",
      "registro_isp": "F-24049/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000029",
      "unidad_medida": "Caja x 21 comp. (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 30,
    "antes": {
      "nombre": "AMOXICILINA 500 mg/5mL POLVO PARA SUSPENSIÓN ORAL",
      "principio_activo": "AMOXICILINA TRIHIDRATO",
      "registro_isp": "F-29463/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000030",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 31,
    "antes": {
      "nombre": "AMOXICILINA CÁPSULAS 500 mg",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-29446/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000031",
      "unidad_medida": "Caja x 21 capsulas (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 32,
    "antes": {
      "nombre": "AMOXICILINA CÁPSULAS 500 mg",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-15189/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000032",
      "unidad_medida": "Caja x 21 capsulas (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 33,
    "antes": {
      "nombre": "AMOXICILINA CÁPSULAS 500 mg",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-23749/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000033",
      "unidad_medida": "Caja x 21 capsulas (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 34,
    "antes": {
      "nombre": "AMOXICILINA CÁPSULAS 500 mg",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-22295/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000034",
      "unidad_medida": "Caja x 21 capsulas (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 35,
    "antes": {
      "nombre": "AMOXICILINA CÁPSULAS 500 mg",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-26670/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000035",
      "unidad_medida": "Caja x 21 capsulas (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 36,
    "antes": {
      "nombre": "AMOXICILINA COMPRIMIDOS 750 mg",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-6857/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000036",
      "unidad_medida": "Caja x 21 comp. (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 37,
    "antes": {
      "nombre": "AMOXICILINA POLVO PARA SUSPENSIÓN ORAL 250 mg/ 5 mL",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-25725/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000037",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 38,
    "antes": {
      "nombre": "AMOXICILINA POLVO PARA SUSPENSION ORAL 250 mg/5 mL",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-27209/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000038",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 39,
    "antes": {
      "nombre": "AMOXICILINA POLVO PARA SUSPENSIÓN ORAL 250 mg/5 mL",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-27486/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000039",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 40,
    "antes": {
      "nombre": "AMOXICILINA POLVO PARA SUSPENSIÓN ORAL 250 mg/5 mL",
      "principio_activo": "AMOXICILINA",
      "registro_isp": "F-25889/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000040",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 2,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 67,
    "antes": {
      "nombre": "BEDIATIL COMPRIMIDOS 200 mg (IBUPROFENO)",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-6436/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000067",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 46,
    "antes": {
      "nombre": "CETIREX COMPRIMIDOS RECUBIERTOS 10 mg (CETIRIZINA DICLORHIDRATO)",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-26058/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000046",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 47,
    "antes": {
      "nombre": "CETIREX COMPRIMIDOS RECUBIERTOS 10 mg (CETIRIZINA DICLORHIDRATO)",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-29675/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000047",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 48,
    "antes": {
      "nombre": "CETIREX COMPRIMIDOS RECUBIERTOS 10 mg (CETIRIZINA)",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-23976/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000048",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 49,
    "antes": {
      "nombre": "CETIRIZINA CLORHIDRATO COMPRIMIDOS RECUBIERTOS 10 mg",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-26540/21",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000049",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 50,
    "antes": {
      "nombre": "CETIRIZINA CLORHIDRATO COMPRIMIDOS RECUBIERTOS 10 mg",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-26990/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000050",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 51,
    "antes": {
      "nombre": "CETIRIZINA DICLORHIDRATO COMPRIMIDOS RECUBIERTOS 10 mg",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-26817/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000051",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 52,
    "antes": {
      "nombre": "CETIRIZINA DICLORHIDRATO COMPRIMIDOS RECUBIERTOS 10 mg",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-27471/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000052",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 53,
    "antes": {
      "nombre": "CETIRIZINA DICLORHIDRATO COMPRIMIDOS RECUBIERTOS 10 mg",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-26057/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000053",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 54,
    "antes": {
      "nombre": "CETIRIZINA DICLORHIDRATO COMPRIMIDOS RECUBIERTOS 10 mg",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-26977/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000054",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 55,
    "antes": {
      "nombre": "CETIRIZINA DICLORHIDRATO COMPRIMIDOS RECUBIERTOS 10 mg",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-28041/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000055",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 56,
    "antes": {
      "nombre": "CETIRIZINA DICLORHIDRATO COMPRIMIDOS RECUBIERTOS 10 mg",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-29676/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000056",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 57,
    "antes": {
      "nombre": "CETIRIZINA DICLORHIDRATO COMPRIMIDOS RECUBIERTOS 10 mg",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-10073/21",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000057",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 58,
    "antes": {
      "nombre": "CETIRIZINA DICLORHIDRATO JARABE 5 mg/5 mL",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-25139/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000058",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 59,
    "antes": {
      "nombre": "CETIRIZINA DICLORHIDRATO JARABE 5 mg/5 mL",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-16583/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000059",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 60,
    "antes": {
      "nombre": "CETIRIZINA DICLORHIDRATO SOLUCIÓN ORAL 5 mg /5 mL",
      "principio_activo": "CETIRIZINA",
      "registro_isp": "F-25696/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000060",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 61,
    "antes": {
      "nombre": "CETIRIZINA DICLORHIDRATO SOLUCIÓN ORAL PARA GOTAS 10 mg/mL",
      "principio_activo": "CETIRIZINA DICLORHIDRATO",
      "registro_isp": "F-28742/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000061",
      "unidad_medida": "Frasco gotero x 20 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 62,
    "antes": {
      "nombre": "CETIRIZINA SOLUCIÓN ORAL 5 mg/5 mL",
      "principio_activo": "CETIRIZINA DICLORHIDRATO",
      "registro_isp": "F-29773/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000062",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 63,
    "antes": {
      "nombre": "CETLINE COMPRIMIDOS RECUBIERTOS 5 mg (LEVOCETIRIZINA DICLORHIDRATO)",
      "principio_activo": "LEVOCETIRIZINA DICLORHIDRATO",
      "registro_isp": "F-29965/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000063",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 64,
    "antes": {
      "nombre": "CETLINE COMPRIMIDOS RECUBIERTOS 5 mg (LEVOCETIRIZINA DICLORHIDRATO)",
      "principio_activo": "LEVOCETIRIZINA DICLORHIDRATO",
      "registro_isp": "F-26484/21",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000064",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 65,
    "antes": {
      "nombre": "CETLINE COMPRIMIDOS RECUBIERTOS 5 mg (LEVOCETIRIZINA DICLORHIDRATO)",
      "principio_activo": "LEVOCETIRIZINA",
      "registro_isp": "F-28949/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000065",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 165,
    "antes": {
      "nombre": "COR COMPRIMIDOS CON RECUBRIMIENTO ENTÉRICO 20 mg (ESOMEPRAZOL)",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-27341/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000165",
      "unidad_medida": "Caja x 28 comp. (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 166,
    "antes": {
      "nombre": "COR COMPRIMIDOS CON RECUBRIMIENTO ENTÉRICO 40 mg (ESOMEPRAZOL)",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-27340/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000166",
      "unidad_medida": "Caja x 28 comp. (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 116,
    "antes": {
      "nombre": "CORODIN D 100/12,5 COMPRIMIDOS RECUBIERTOS (LOSARTAN POTASICO / HIDROCLOROTIAZIDA)",
      "principio_activo": "HIDROCLOROTIAZIDA//LOSARTAN",
      "registro_isp": "F-19544/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000116",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 117,
    "antes": {
      "nombre": "COZAAR COMPRIMIDOS RECUBIERTOS 100 mg (LOSARTAN POTÁSICO)",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-12460/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000117",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 118,
    "antes": {
      "nombre": "COZAAR COMPRIMIDOS RECUBIERTOS 50 mg (LOSARTÁN POTÁSICO)",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-21038/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000118",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 94,
    "antes": {
      "nombre": "D-HISTIN JARABE 2,5 mg/5 mL (DESLORATADINA)",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-29932/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000094",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 95,
    "antes": {
      "nombre": "Desinaler 5 mg comprimidos (desloratadina)",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-27397/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000095",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 96,
    "antes": {
      "nombre": "DESLORATADINA COMPRIMIDOS RECUBIERTOS 5 mg",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-26366/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000096",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 97,
    "antes": {
      "nombre": "DESLORATADINA COMPRIMIDOS RECUBIERTOS 5 mg",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-25943/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000097",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 98,
    "antes": {
      "nombre": "DESLORATADINA COMPRIMIDOS RECUBIERTOS 5 mg",
      "principio_activo": "Desloratadina",
      "registro_isp": "F-29359/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000098",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 99,
    "antes": {
      "nombre": "DESLORATADINA COMPRIMIDOS RECUBIERTOS 5 mg",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-15112/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000099",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 100,
    "antes": {
      "nombre": "DESLORATADINA COMPRIMIDOS RECUBIERTOS 5 mg",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-16474/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000100",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 101,
    "antes": {
      "nombre": "DESLORATADINA JARABE 2,5 mg/ 5 mL",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-15111/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000101",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 102,
    "antes": {
      "nombre": "DESLORATADINA JARABE 2,5 mg/5 mL",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-29848/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000102",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 103,
    "antes": {
      "nombre": "DESLORATADINA JARABE 2,5 mg/5 mL",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-17750/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000103",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 104,
    "antes": {
      "nombre": "DESLORATADINA JARABE 2,5 mg/5 mL",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-27087/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000104",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 105,
    "antes": {
      "nombre": "DESLORATADINA SOLUCIÓN ORAL 2,5 mg/5 mL",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-30107/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000105",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 106,
    "antes": {
      "nombre": "DESLORATADINA SOLUCIÓN ORAL 2,5 mg/5 mL",
      "principio_activo": "DESLORATADINA",
      "registro_isp": "F-29911/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000106",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 68,
    "antes": {
      "nombre": "DEUCODOL FORTE SUSPENSIÓN ORAL 200 mg/5 mL (IBUPROFENO)",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-25702/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000068",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 69,
    "antes": {
      "nombre": "DOLORUB GEL DÉRMICO 5% (IBUPROFENO)",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-1920/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000069",
      "unidad_medida": "Tubo x 30 g (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 195,
    "antes": {
      "nombre": "DOLOTEN COMPRIMIDOS (PARACETAMOL/TRAMADOL)",
      "principio_activo": "PARACETAMOL//TRAMADOL",
      "registro_isp": "F-23729/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000195",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 70,
    "antes": {
      "nombre": "DORALIV 600 CÁPSULAS BLANDAS 600 mg (IBUPROFENO)",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-25896/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000070",
      "unidad_medida": "Caja x 20 capsulas (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 71,
    "antes": {
      "nombre": "DORALIV CÁPSULAS BLANDAS 400 mg (IBUPROFENO)",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-25335/20",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000071",
      "unidad_medida": "Caja x 20 capsulas (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 196,
    "antes": {
      "nombre": "DROPOL COMPRIMIDOS 1 g (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-26669/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000196",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 197,
    "antes": {
      "nombre": "DROPOL COMPRIMIDOS EFERVESCENTES 1 g (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-28583/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000197",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 167,
    "antes": {
      "nombre": "EMNEX-40 LIOFILIZADO PARA SOLUCIÓN INYECTABLE 40 mg (ESOMEPRAZOL)",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-27296/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000167",
      "unidad_medida": "Caja x 1 vial (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 168,
    "antes": {
      "nombre": "ESOFLUX CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 20 mg (ESOMEPRAZOL)",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-25985/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000168",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 169,
    "antes": {
      "nombre": "ESOFLUX CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 40 mg (ESOMEPRAZOL)",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-25984/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000169",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 170,
    "antes": {
      "nombre": "ESOMEPRAZOL CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 20 mg",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-24107/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000170",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 171,
    "antes": {
      "nombre": "ESOMEPRAZOL CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 20 mg",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-25886/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000171",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 172,
    "antes": {
      "nombre": "ESOMEPRAZOL CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 20 mg",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-27387/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000172",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 173,
    "antes": {
      "nombre": "ESOMEPRAZOL CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 20 mg",
      "principio_activo": "Esomeprazol",
      "registro_isp": "F-28767/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000173",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 174,
    "antes": {
      "nombre": "ESOMEPRAZOL CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 40 mg",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-28766/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000174",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 175,
    "antes": {
      "nombre": "ESOMEPRAZOL CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 40 mg",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-24160/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000175",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 176,
    "antes": {
      "nombre": "ESOMEPRAZOL CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 40 mg",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-25885/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000176",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 177,
    "antes": {
      "nombre": "ESOMEPRAZOL CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 40 mg",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-27388/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000177",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 178,
    "antes": {
      "nombre": "ESOMEPRAZOL COMPRIMIDOS CON RECUBRIMIENTO ENTÉRICO 20 mg",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-24505/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000178",
      "unidad_medida": "Caja x 28 comp. (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 179,
    "antes": {
      "nombre": "ESOMEPRAZOL COMPRIMIDOS CON RECUBRIMIENTO ENTÉRICO 20 mg",
      "principio_activo": "ESOMEPRAZOL MAGNÉSICO TRIHIDRATO",
      "registro_isp": "F-29870/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000179",
      "unidad_medida": "Caja x 28 comp. (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 180,
    "antes": {
      "nombre": "ESOMEPRAZOL COMPRIMIDOS CON RECUBRIMIENTO ENTERICO 40 mg",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-23524/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000180",
      "unidad_medida": "Caja x 28 comp. (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 181,
    "antes": {
      "nombre": "ESOMEPRAZOL COMPRIMIDOS CON RECUBRIMIENTO ENTÉRICO 40 mg",
      "principio_activo": "ESOMEPRAZOL MAGNÉSICO TRIHIDRATO",
      "registro_isp": "F-29873/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000181",
      "unidad_medida": "Caja x 28 comp. (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 182,
    "antes": {
      "nombre": "ESOMEPRAZOL LIOFILIZADO PARA SOLUCIÓN INYECTABLE 40 mg",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-25524/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000182",
      "unidad_medida": "Caja x 1 vial (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 183,
    "antes": {
      "nombre": "ESOMEPRAZOL LIOFILIZADO PARA SOLUCIÓN INYECTABLE 40 mg",
      "principio_activo": "ESOMEPRAZOL SÓDICO",
      "registro_isp": "F-28899/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000183",
      "unidad_medida": "Caja x 1 vial (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 184,
    "antes": {
      "nombre": "ESOMEPRAZOL LIOFILIZADO PARA SOLUCIÓN INYECTABLE 40 mg",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-27848/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000184",
      "unidad_medida": "Caja x 1 vial (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 185,
    "antes": {
      "nombre": "ESOPOLE CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 20 mg (ESOMEPRAZOL)",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-25904/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000185",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 186,
    "antes": {
      "nombre": "ESOPOLE CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 40 mg (ESOMEPRAZOL)",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-26077/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000186",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 187,
    "antes": {
      "nombre": "ESOZOLE CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 20 mg (ESOMEPRAZOL)",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-25884/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000187",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 188,
    "antes": {
      "nombre": "ESOZOLE CÁPSULAS CON GRÁNULOS CON RECUBRIMIENTO ENTÉRICO 40 mg (ESOMEPRAZOL)",
      "principio_activo": "ESOMEPRAZOL",
      "registro_isp": "F-25876/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000188",
      "unidad_medida": "Caja x 28 capsulas (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 189,
    "antes": {
      "nombre": "ESOZOLE COMPRIMIDOS CON RECUBRIMIENTO ENTÉRICO 40 mg (ESOMEPRAZOL)",
      "principio_activo": "ESOMEPRAZOL MAGNESICO TRIHIDRATO",
      "registro_isp": "F-29872/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000189",
      "unidad_medida": "Caja x 28 comp. (ref.)",
      "id_categoria": 5,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 198,
    "antes": {
      "nombre": "ETHONDOL COMPRIMIDOS 1000 mg (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-28326/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000198",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 199,
    "antes": {
      "nombre": "GENIOL 1 COMPRIMIDOS 1000 mg (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-27526/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000199",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 200,
    "antes": {
      "nombre": "GENIOL COMPRIMIDOS 500 mg (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-27455/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000200",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 201,
    "antes": {
      "nombre": "GENIOL INFANTIL COMPRIMIDOS MASTICABLES 160 mg (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-28778/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000201",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 202,
    "antes": {
      "nombre": "GENIOL SOLUCIÓN ORAL PARA GOTAS 100 mg/mL (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-13238/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000202",
      "unidad_medida": "Frasco gotero x 20 mL (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 203,
    "antes": {
      "nombre": "GESIDOL COMPRIMIDOS 1 g (PARACETAMOL)",
      "principio_activo": "Paracetamol",
      "registro_isp": "F-23750/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000203",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 204,
    "antes": {
      "nombre": "GESIDOL INFANTIL SOLUCIÓN PARA GOTAS ORALES 100 mg/mL (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-24178/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000204",
      "unidad_medida": "Frasco gotero x 20 mL (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 140,
    "antes": {
      "nombre": "GLAFORNIL 1000 COMPRIMIDOS RECUBIERTOS 1000 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-10050/21",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000140",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 141,
    "antes": {
      "nombre": "GLAFORNIL 500 COMPRIMIDOS RECUBIERTOS 500 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-122/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000141",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 142,
    "antes": {
      "nombre": "GLAFORNIL 850 COMPRIMIDOS RECUBIERTOS 850 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-10495/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000142",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 143,
    "antes": {
      "nombre": "GLAFORNIL XR 1000 COMPRIMIDOS DE LIBERACIÓN PROLONGADA 1000 mg (METFORMINA)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-21095/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000143",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 144,
    "antes": {
      "nombre": "GLAFORNIL XR 500 COMPRIMIDOS DE LIBERACIÓN PROLONGADA 500 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "Metformina Clorhidrato",
      "registro_isp": "F-20048/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000144",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 145,
    "antes": {
      "nombre": "GLAFORNIL XR 850 COMPRIMIDOS DE LIBERACIÓN PROLONGADA 850 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-26531/21",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000145",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 146,
    "antes": {
      "nombre": "GLAUPAX 1000 XR COMPRIMIDOS DE LIBERACIÓN PROLONGADA 1000 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-22956/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000146",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 147,
    "antes": {
      "nombre": "GLAUPAX 500 XR COMPRIMIDOS DE LIBERACIÓN PROLONGADA 500 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-22954/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000147",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 148,
    "antes": {
      "nombre": "GLAUPAX 750 XR COMPRIMIDOS RECUBIERTOS DE LIBERACIÓN PROLONGADA 750 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-22955/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000148",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 149,
    "antes": {
      "nombre": "GLICENEX SR COMPRIMIDOS DE LIBERACIÓN PROLONGADA 1000 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-23947/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000149",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 150,
    "antes": {
      "nombre": "GLICENEX SR COMPRIMIDOS DE LIBERACIÓN PROLONGADA 750 mg (METFORMINA)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-17224/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000150",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 151,
    "antes": {
      "nombre": "GLICOSOL 1000 XR COMPRIMIDOS DE LIBERACION PROLONGADA 1.000 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-25167/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000151",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 152,
    "antes": {
      "nombre": "GLICOSOL 500 XR COMPRIMIDOS DE LIBERACION PROLONGADA 500 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-25165/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000152",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 153,
    "antes": {
      "nombre": "GLICOSOL 750 XR COMPRIMIDOS DE LIBERACION PROLONGADA 750 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-25166/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000153",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 154,
    "antes": {
      "nombre": "GLICOSOL COMPRIMIDOS RECUBIERTOS 850 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-23951/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000154",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 155,
    "antes": {
      "nombre": "GLICOSOL COMPRIMIDOS RECUBIERTOS 850 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-25909/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000155",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 156,
    "antes": {
      "nombre": "GLIFORTEX XR 1000 COMPRIMIDOS RECUBIERTOS DE LIBERACIÓN PROLONGADA 1000 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-24097/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000156",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 157,
    "antes": {
      "nombre": "GLIFORTEX XR COMPRIMIDOS RECUBIERTOS DE LIBERACION PROLONGADA 750 mg (METFORMINA CLORHIDRATO GRÁNULOS CD 95% / METFORMINA CLORHIDRATO 95,0%)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-20012/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000157",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 158,
    "antes": {
      "nombre": "GLIMEFOR COMPRIMIDOS RECUBIERTOS 1000 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-23018/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000158",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 159,
    "antes": {
      "nombre": "GLIMEFOR XR COMPRIMIDOS DE LIBERACIÓN PROLONGADA 1000 mg ( METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-25856/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000159",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 160,
    "antes": {
      "nombre": "GLUCOPHAGE 500 COMPRIMIDOS RECUBIERTOS 500 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-23968/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000160",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 161,
    "antes": {
      "nombre": "GLUCOSAN 1000 XR COMPRIMIDOS RECUBIERTOS DE LIBERACIÓN PROLONGADA 1 g (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-25052/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000161",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 162,
    "antes": {
      "nombre": "GLUCOSAN 750 XR COMPRIMIDOS RECUBIERTOS DE LIBERACIÓN PROLONGADA 750 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-25113/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000162",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 163,
    "antes": {
      "nombre": "GLUCOSAN XR 500 COMPRIMIDOS RECUBIERTOS DE LIBERACIÓN PROLONGADA 500 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-25871/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000163",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 164,
    "antes": {
      "nombre": "HIPOGLUCIN 1000 LP COMPRIMIDOS DE LIBERACIÓN PROLONGADA 1000 mg (METFORMINA CLORHIDRATO)",
      "principio_activo": "METFORMINA",
      "registro_isp": "F-18406/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000164",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 6,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 107,
    "antes": {
      "nombre": "HYSTICLAR SOLUCIÓN ORAL 5 mg/5 mL (LORATADINA)",
      "principio_activo": "LORATADINA",
      "registro_isp": "F-12268/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000107",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 72,
    "antes": {
      "nombre": "IBUALIV FORTE SUSPENSIÓN ORAL 200 mg/5 mL (IBUPROFENO)",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-27510/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000072",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 73,
    "antes": {
      "nombre": "IBUCALM 400 CÁPSULAS BLANDAS 400 mg (IBUPROFENO)",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-26474/21",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000073",
      "unidad_medida": "Caja x 20 capsulas (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 74,
    "antes": {
      "nombre": "IBUCALM 600 CÁPSULAS BLANDAS 600 mg (IBUPROFENO)",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-26473/21",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000074",
      "unidad_medida": "Caja x 20 capsulas (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 75,
    "antes": {
      "nombre": "IBUFREN SUSPENSIÓN ORAL 100 mg/ 5 mL (IBUPROFENO)",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-21861/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000075",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 76,
    "antes": {
      "nombre": "IBUPROFENO - FENILEFRINA CLORHIDRATO 400/10 COMPRIMIDOS RECUBIERTOS",
      "principio_activo": "FENILEFRINA//IBUPROFENO",
      "registro_isp": "F-19334/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000076",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 77,
    "antes": {
      "nombre": "IBUPROFENO 5% CREMA",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-8737/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000077",
      "unidad_medida": "Tubo x 30 g (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 78,
    "antes": {
      "nombre": "IBUPROFENO CÁPSULAS BLANDAS 200 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-21967/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000078",
      "unidad_medida": "Caja x 20 capsulas (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 79,
    "antes": {
      "nombre": "IBUPROFENO CAPSULAS BLANDAS 400 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-28210/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000079",
      "unidad_medida": "Caja x 20 capsulas (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 80,
    "antes": {
      "nombre": "IBUPROFENO COMPRIMIDOS 200 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-12546/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000080",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 81,
    "antes": {
      "nombre": "IBUPROFENO COMPRIMIDOS 400 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-18139/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000081",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 82,
    "antes": {
      "nombre": "IBUPROFENO COMPRIMIDOS 600 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-18140/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000082",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 83,
    "antes": {
      "nombre": "IBUPROFENO COMPRIMIDOS RECUBIERTOS 200 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-20393/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000083",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 84,
    "antes": {
      "nombre": "IBUPROFENO COMPRIMIDOS RECUBIERTOS 400 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-20047/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000084",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 85,
    "antes": {
      "nombre": "IBUPROFENO COMPRIMIDOS RECUBIERTOS 400 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-23290/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000085",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 86,
    "antes": {
      "nombre": "IBUPROFENO COMPRIMIDOS RECUBIERTOS 400 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-7636/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000086",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 87,
    "antes": {
      "nombre": "IBUPROFENO COMPRIMIDOS RECUBIERTOS 600 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-7638/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000087",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 88,
    "antes": {
      "nombre": "IBUPROFENO COMPRIMIDOS RECUBIERTOS 600 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-22842/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000088",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 89,
    "antes": {
      "nombre": "IBUPROFENO COMPRIMIDOS RECUBIERTOS 600 mg",
      "principio_activo": "IBUPROFENO",
      "registro_isp": "F-20013/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000089",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 90,
    "antes": {
      "nombre": "IBUPROFENO METAMIZOL SÓDICO GLICINATO DE ALUMINIO CÁPSULAS",
      "principio_activo": "ALUMINIO HIDROXIDO//IBUPROFENO//METAMIZOL SODICO",
      "registro_isp": "F-8981/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000090",
      "unidad_medida": "Caja x 20 capsulas (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 205,
    "antes": {
      "nombre": "IBUPROFENO/PARACETAMOL 300/300 COMPRIMIDOS",
      "principio_activo": "IBUPROFENO//PARACETAMOL",
      "registro_isp": "F-3279/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000205",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 206,
    "antes": {
      "nombre": "KITADOL INFANTIL SOLUCIÓN ORAL PARA GOTAS 100 mg/mL (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-17515/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000206",
      "unidad_medida": "Frasco gotero x 20 mL (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 119,
    "antes": {
      "nombre": "LOPREN COMPRIMIDOS RECUBIERTOS 50 mg (LOSARTÁN POTÁSICO)",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-14316/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000119",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 108,
    "antes": {
      "nombre": "LORATADINA COMPRIMIDOS 10 mg",
      "principio_activo": "LORATADINA",
      "registro_isp": "F-24616/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000108",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 109,
    "antes": {
      "nombre": "LORATADINA COMPRIMIDOS 10 mg",
      "principio_activo": "LORATADINA",
      "registro_isp": "F-16767/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000109",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 110,
    "antes": {
      "nombre": "LORATADINA COMPRIMIDOS 10 mg",
      "principio_activo": "LORATADINA",
      "registro_isp": "F-8455/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000110",
      "unidad_medida": "Caja x 10 comp. (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 111,
    "antes": {
      "nombre": "LORATADINA SOLUCIÓN ORAL 5 mg/5 mL",
      "principio_activo": "LORATADINA",
      "registro_isp": "F-11864/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000111",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 112,
    "antes": {
      "nombre": "LORATADINA SOLUCIÓN ORAL 5 mg/5 mL",
      "principio_activo": "LORATADINA",
      "registro_isp": "F-9902/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000112",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 113,
    "antes": {
      "nombre": "LORATADINA SOLUCIÓN ORAL 5 mg/5 mL",
      "principio_activo": "LORATADINA",
      "registro_isp": "F-25492/20",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000113",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 114,
    "antes": {
      "nombre": "LORATADINA SOLUCION ORAL 5mg/5mL.",
      "principio_activo": "LORATADINA",
      "registro_isp": "F-28821/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000114",
      "unidad_medida": "Frasco x 100 mL (ref.)",
      "id_categoria": 4,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 120,
    "antes": {
      "nombre": "LOSAPRES 100 COMPRIMIDOS RECUBIERTOS 100 mg (LOSARTÁN POTÁSICO)",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-24990/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000120",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 121,
    "antes": {
      "nombre": "LOSAPRES 50 COMPRIMIDOS RECUBIERTOS 50 mg (LOSARTAN POTÁSICO)",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-24989/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000121",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 122,
    "antes": {
      "nombre": "LOSARTAN POTÁSICO COMPRIMIDOS RECUBIERTOS 100 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-21746/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000122",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 123,
    "antes": {
      "nombre": "LOSARTAN POTÁSICO COMPRIMIDOS RECUBIERTOS 100 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-20493/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000123",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 124,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 100 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-22733/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000124",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 125,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 100 mg",
      "principio_activo": "LOSARTÁN POTÁSICO",
      "registro_isp": "F-23645/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000125",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 126,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 100 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-27872/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000126",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 127,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 100 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-28411/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000127",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 128,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 100 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-28741/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000128",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 129,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 100 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-17498/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000129",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 130,
    "antes": {
      "nombre": "LOSARTÁN POTASICO COMPRIMIDOS RECUBIERTOS 50 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-23447/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000130",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 131,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 50 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-18420/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000131",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 132,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 50 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-27006/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000132",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 133,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 50 mg",
      "principio_activo": "LOSARTÁN POTÁSICO",
      "registro_isp": "F-30000/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000133",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 134,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 50 mg",
      "principio_activo": "LOSARTÁN POTÁSICO",
      "registro_isp": "F-29725/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000134",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 135,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 50 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-13738/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000135",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 136,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 50 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-14315/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000136",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 137,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 50 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-8741/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000137",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 138,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 50 mg",
      "principio_activo": "LOSARTAN",
      "registro_isp": "F-24122/23",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000138",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 139,
    "antes": {
      "nombre": "LOSARTÁN POTÁSICO COMPRIMIDOS RECUBIERTOS 50 mg",
      "principio_activo": "LOSARTÁN POTÁSICO",
      "registro_isp": "F-28282/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000139",
      "unidad_medida": "Caja x 30 comp. (ref.)",
      "id_categoria": 3,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 207,
    "antes": {
      "nombre": "PANADOL ADVANCE COMPRIMIDOS RECUBIERTOS 500 mg (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-25708/25",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000207",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 208,
    "antes": {
      "nombre": "PANADOL COMPRIMIDOS MASTICABLES 80 mg (PARACETAMOL)",
      "principio_activo": "Paracetamol",
      "registro_isp": "F-24670/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000208",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 209,
    "antes": {
      "nombre": "PANAGESIC COMPRIMIDOS 1000 mg (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-29546/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000209",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 210,
    "antes": {
      "nombre": "PANAGESIC COMPRIMIDOS 500 mg (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-29545/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000210",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 211,
    "antes": {
      "nombre": "PANAGESIC COMPRIMIDOS EFERVESCENTES 1 g (PARACETAMOL)",
      "principio_activo": "PARACETAMOL",
      "registro_isp": "F-27117/22",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000211",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 212,
    "antes": {
      "nombre": "PARACETAMOL + CAFEÍNA CÁPSULAS BLANDAS",
      "principio_activo": "CAFEINA//PARACETAMOL",
      "registro_isp": "F-2287/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000212",
      "unidad_medida": "Caja x 20 capsulas (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 213,
    "antes": {
      "nombre": "PARACETAMOL + CAFEÍNA CÁPSULAS BLANDAS",
      "principio_activo": "CAFEINA//PARACETAMOL",
      "registro_isp": "F-2288/24",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000213",
      "unidad_medida": "Caja x 20 capsulas (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  },
  {
    "id_producto": 214,
    "antes": {
      "nombre": "PARACETAMOL + MEPIRAMINA MALEATO + PAMABRON COMPRIMIDOS",
      "principio_activo": "MEPIRAMINA//PAMABRON//PARACETAMOL",
      "registro_isp": "F-8663/26",
      "codigo_barras": null,
      "unidad_medida": null,
      "id_categoria": 9,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase."
    },
    "despues": {
      "codigo_barras": "INT-ISP-000214",
      "unidad_medida": "Caja x 20 comp. (ref.)",
      "id_categoria": 1,
      "descripcion": "Registro sanitario ISP. Confirmar presentación y GTIN en el envase. Presentacion de referencia para video, no verificada en envase. Codigo interno SIGAF, no GTIN comercial."
    }
  }
]
$plan_catalogo$::jsonb;
  r jsonb; v_actual public.producto; v_antes jsonb; v_despues jsonb;
  v_identidad_antes text; v_identidad_despues text;
BEGIN
  SELECT md5(jsonb_agg(to_jsonb(p)-'codigo_barras'-'unidad_medida'-'id_categoria'-'descripcion' ORDER BY id_producto)::text)
    INTO v_identidad_antes FROM public.producto p;
  IF jsonb_array_length(v_plan) <> 198 THEN RAISE EXCEPTION 'Manifiesto incompleto'; END IF;
  FOR r IN SELECT value FROM jsonb_array_elements(v_plan) LOOP
    SELECT * INTO STRICT v_actual FROM public.producto WHERE id_producto=(r->>'id_producto')::int FOR UPDATE;
    v_antes := r->'antes'; v_despues := r->'despues';
    IF v_actual.nombre IS DISTINCT FROM v_antes->>'nombre'
      OR v_actual.principio_activo IS DISTINCT FROM v_antes->>'principio_activo'
      OR v_actual.registro_isp IS DISTINCT FROM v_antes->>'registro_isp' THEN
      RAISE EXCEPTION 'Cambio concurrente en identidad de producto %',v_actual.id_producto;
    END IF;
    -- Si ya se aplico exactamente, no modificar de nuevo.
    IF jsonb_build_object('codigo_barras',v_actual.codigo_barras,'unidad_medida',v_actual.unidad_medida,
        'id_categoria',v_actual.id_categoria,'descripcion',v_actual.descripcion)=v_despues THEN CONTINUE; END IF;
    IF jsonb_build_object('codigo_barras',v_actual.codigo_barras,'unidad_medida',v_actual.unidad_medida,
        'id_categoria',v_actual.id_categoria,'descripcion',v_actual.descripcion)
      IS DISTINCT FROM v_antes-'nombre'-'principio_activo'-'registro_isp' THEN
      RAISE EXCEPTION 'La ficha % fue editada: revisar antes de sobrescribir',v_actual.id_producto;
    END IF;
    IF EXISTS(SELECT 1 FROM public.lote WHERE id_producto=v_actual.id_producto) THEN
      RAISE EXCEPTION 'La ficha % ya tiene lotes; confirmar su presentacion real',v_actual.id_producto;
    END IF;
    IF NOT EXISTS(SELECT 1 FROM public.categoria WHERE id_categoria=(v_despues->>'id_categoria')::int) THEN
      RAISE EXCEPTION 'Categoria inexistente';
    END IF;
    UPDATE public.producto
      SET codigo_barras=v_despues->>'codigo_barras', unidad_medida=v_despues->>'unidad_medida',
          id_categoria=(v_despues->>'id_categoria')::int, descripcion=v_despues->>'descripcion'
      WHERE id_producto=v_actual.id_producto;
  END LOOP;
  SELECT md5(jsonb_agg(to_jsonb(p)-'codigo_barras'-'unidad_medida'-'id_categoria'-'descripcion' ORDER BY id_producto)::text)
    INTO v_identidad_despues FROM public.producto p;
  IF v_identidad_antes IS DISTINCT FROM v_identidad_despues THEN RAISE EXCEPTION 'Se modificaron datos sanitarios o identificadores'; END IF;
END $completar_catalogo$;
COMMIT;

