"use client";

export function UpgradeDialog({
  text, confirm, onClose, onSeePlans,
}: {
  text: string;
  confirm?: () => void;
  onClose: () => void;
  onSeePlans: () => void;
}) {
  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
      <div className="w-full max-w-sm rounded-xl border border-white/10 bg-panel p-4">
        <h3 className="text-sm font-medium">{confirm ? "Confirmar plan" : "Límite alcanzado"}</h3>
        <p className="my-2 text-xs text-zinc-400">{text}</p>

        {confirm ? (
          <>
            <label className="mt-1 flex flex-col gap-1 text-xs text-zinc-400">
              Tarjeta
              <input defaultValue="4242 4242 4242 4242" maxLength={19} className="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-sm" />
            </label>
            <p className="mt-2 text-[11px] text-zinc-500">Cualquier número sirve: no se valida contra ninguna pasarela.</p>
          </>
        ) : (
          <button onClick={() => { onClose(); onSeePlans(); }} className="btn bg-vio text-white">Ver planes</button>
        )}

        <div className="mt-3 flex gap-2">
          {confirm && (
            <button onClick={() => { confirm(); onClose(); }} className="btn bg-vio text-white">Confirmar</button>
          )}
          <button onClick={onClose} className="btn border border-white/10">Cancelar</button>
        </div>
      </div>
    </div>
  );
}