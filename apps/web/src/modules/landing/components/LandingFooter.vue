<template>
  <footer class="bg-slate-950 text-slate-400 py-16 px-6">
    <div class="max-w-7xl mx-auto flex flex-col items-center text-center">
      <span class="font-manrope font-extrabold text-2xl text-white tracking-tight block mb-4">Reserva Aí!</span>
      <p class="text-sm leading-relaxed mb-8 max-w-md opacity-70">
        A plataforma de gestão de espaços que une moradores e administração através da tecnologia e transparência.
      </p>
      <div
        class="w-full pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <p class="text-[10px] opacity-50 uppercase tracking-wider">
          © {{ new Date().getFullYear() }} Reserva Aí! Software de Gestão Condominial LTDA.
        </p>
        <span class="text-[10px] opacity-50 uppercase tracking-wider">Feito com carinho para síndicos modernos.</span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts"></script>

<style scoped>
.font-manrope {
  font-family: "Manrope", sans-serif;
}
.material-symbols-outlined {
  font-variation-settings:
    "FILL" 0,
    "wght" 400,
    "GRAD" 0,
    "opsz" 24;
}
</style>
