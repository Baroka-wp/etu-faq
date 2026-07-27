"use client";

import { useEffect, useState } from "react";
import { Phone, User } from "lucide-react";
import QRCode from "qrcode";

export interface MemberIdentityCardData {
  id: string;
  nom: string;
  prenoms: string;
  nomSacre: string | null;
  grade: string;
  equipage: string;
  telephoneWhatsapp: string;
  statut: string;
  imageUrl: string | null;
  createdAt: string;
}

interface MemberIdentityCardProps {
  membre: MemberIdentityCardData;
  className?: string;
}

export default function MemberIdentityCard({
  membre,
  className = "",
}: MemberIdentityCardProps) {
  const [qrCode, setQrCode] = useState("");
  const dateDelivrance = new Date(membre.createdAt);
  const dateExpiration = new Date(dateDelivrance);
  dateExpiration.setFullYear(dateExpiration.getFullYear() + 3);
  const telephoneAffiche = membre.telephoneWhatsapp
    .replace(/[^\d+\s().-]/g, "")
    .trim();
  const formatDate = (date: Date) =>
    date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  useEffect(() => {
    QRCode.toDataURL(`OMP-MEMBRE:${membre.id}`, {
      width: 320,
      margin: 1,
      errorCorrectionLevel: "H",
      color: { dark: "#172033", light: "#FFFFFF" },
    })
      .then(setQrCode)
      .catch(() => setQrCode(""));
  }, [membre.id]);

  return (
    <section
      className={`relative aspect-[1011/638] w-full overflow-hidden rounded-2xl border border-[#d9c990] bg-[#f8f5ea] text-[#172033] shadow-[0_20px_55px_-35px_rgba(23,32,51,0.65)] ${className}`}
      aria-label={`Carte de membre de ${membre.prenoms} ${membre.nom}`}
    >
      <div className="h-1.5 bg-[linear-gradient(90deg,#11843b_0_33%,#e3c33b_33%_66%,#c91f3b_66%)]" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full border-[28px] border-[#d9c990]/20" />
      <img
        src="/ange-gardien-carte.png"
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[-10%] left-[28%] h-[88%] object-contain opacity-[0.10]"
      />

      <div className="relative flex h-[calc(100%-0.375rem)] flex-col px-3 pb-8 pt-3 sm:px-7 sm:pb-14 sm:pt-7">
        <header className="flex shrink-0 items-center gap-2 sm:gap-4">
          <img
            src="/logo-etu.png"
            alt=""
            className="h-9 w-9 shrink-0 object-contain sm:h-16 sm:w-16"
          />
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase leading-tight tracking-[0.045em] sm:text-[17px]">
              Ordre des Marins Pêcheurs
            </p>
            <p className="text-[6px] font-semibold uppercase leading-tight tracking-[0.035em] text-[#7c6b35] sm:mt-0.5 sm:text-[11px]">
              de l’École Transcendantaliste Universelle
            </p>
            <p className="mt-0.5 text-[6px] font-bold uppercase tracking-[0.12em] text-[#315a83] sm:mt-1 sm:text-[10px]">
              Grand Navire du Bénin
            </p>
          </div>
        </header>

        <div className="grid flex-1 grid-cols-[minmax(0,1fr)_90px] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_180px] sm:gap-8">
          <div className="min-w-0">
            <div className="flex items-center gap-2 sm:gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-white shadow-sm sm:h-28 sm:w-28">
                {membre.imageUrl ? (
                  <img
                    src={membre.imageUrl}
                    alt={`${membre.prenoms} ${membre.nom}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-6 w-6 text-slate-400 sm:h-12 sm:w-12" />
                )}
              </div>
              <div className="min-w-0">
                <p className="flex flex-wrap text-xs font-bold leading-tight sm:text-2xl">
                  {`${membre.prenoms} ${membre.nom}`
                    .trim()
                    .split(/\s+/)
                    .map((part, index) => (
                      <span key={`${part}-${index}`}>
                        {part}
                        {"\u00A0"}
                      </span>
                    ))}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-[#7c6b35] sm:mt-2 sm:text-lg sm:tracking-[0.12em]">
                  {membre.nomSacre || "Nom sacré non renseigné"}
                </p>
                <p className="mt-1 text-[9px] text-slate-600 sm:mt-3 sm:text-base">
                  {membre.grade} · Équipage {membre.equipage}
                </p>
              </div>
            </div>

            <div className="mt-2 inline-flex items-center gap-1.5 text-slate-600 sm:mt-7 sm:gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#d9c990]/25 text-[#7c6b35] sm:h-9 sm:w-9">
                <Phone className="h-2.5 w-2.5 sm:h-4 sm:w-4" />
              </span>
              <span>
                <span className="block text-[5px] font-semibold uppercase tracking-[0.12em] text-slate-400 sm:text-[9px]">
                  Téléphone
                </span>
                <span className="block whitespace-nowrap text-[8px] font-bold tracking-[0.04em] text-[#172033] sm:text-[15px]">
                  {telephoneAffiche}
                </span>
              </span>
            </div>
          </div>

          <div className="self-center">
            <div className="rounded-lg border border-[#d9c990] bg-white p-1.5 shadow-sm sm:rounded-2xl sm:p-3">
              {qrCode ? (
                <img
                  src={qrCode}
                  alt="QR code d'identification du membre"
                  className="aspect-square w-full"
                />
              ) : (
                <div className="aspect-square w-full animate-pulse rounded-md bg-slate-100" />
              )}
            </div>
          </div>
        </div>

        <footer className="grid shrink-0 grid-cols-2 gap-3 border-t border-[#d9c990]/80 pt-1.5 text-[6px] uppercase tracking-[0.08em] text-slate-500 sm:gap-8 sm:pt-3 sm:text-[10px]">
          <p>
            Délivrée le{" "}
            <strong className="text-[#172033]">
              {formatDate(dateDelivrance)}
            </strong>
          </p>
          <p className="text-right">
            Expire le{" "}
            <strong className="text-[#172033]">
              {formatDate(dateExpiration)}
            </strong>
          </p>
        </footer>
      </div>

      <div className="absolute inset-x-0 bottom-0 z-10 flex h-7 items-center justify-center bg-[#172033] px-3 text-center text-[6px] font-bold uppercase tracking-[0.08em] text-white sm:h-11 sm:px-7 sm:text-[12px] sm:tracking-[0.12em]">
        <span className="whitespace-nowrap leading-normal">
          {membre.nomSacre || "Nom sacré non renseigné"} — Carte N°{" "}
          {membre.id.slice(-8).toUpperCase()} — Grand Navire du Bénin
        </span>
      </div>
    </section>
  );
}
