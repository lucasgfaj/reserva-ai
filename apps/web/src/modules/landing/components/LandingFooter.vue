<template>
  <footer class="bg-slate-950 text-slate-400 py-16 px-6">
    <div class="max-w-7xl mx-auto grid md:grid-cols-4 gap-12">
      <div class="md:col-span-1">
        <span
          class="font-manrope font-extrabold text-2xl text-white tracking-tight block mb-6"
          >Reserva Aí!</span
        >
        <p class="text-sm leading-relaxed mb-6 opacity-70">
          A plataforma de gestão de espaços que une moradores e administração
          através da tecnologia e transparência.
        </p>
        <div class="flex gap-4">
          <a
            class="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-sky-900 transition-colors text-white"
            href="#"
          >
            <span class="material-symbols-outlined text-sm">share</span>
          </a>
          <a
            class="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center hover:bg-sky-900 transition-colors text-white"
            href="#"
          >
            <span class="material-symbols-outlined text-sm">mail</span>
          </a>
        </div>
      </div>
      <div>
        <h4
          class="font-manrope font-bold text-white mb-6 uppercase text-[10px] tracking-widest"
        >
          Plataforma
        </h4>
        <ul class="space-y-4 text-sm">
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#"
              >Funcionalidades</a
            >
          </li>
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#"
              >Portaria Digital</a
            >
          </li>
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#"
              >App do Morador</a
            >
          </li>
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#"
              >Integrações</a
            >
          </li>
        </ul>
      </div>
      <div>
        <h4
          class="font-manrope font-bold text-white mb-6 uppercase text-[10px] tracking-widest"
        >
          Suporte
        </h4>
        <ul class="space-y-4 text-sm">
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#"
              >Central de Ajuda</a
            >
          </li>
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#"
              >Treinamentos</a
            >
          </li>
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#">Contato</a>
          </li>
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#"
              >Status do Sistema</a
            >
          </li>
        </ul>
      </div>
      <div>
        <h4
          class="font-manrope font-bold text-white mb-6 uppercase text-[10px] tracking-widest"
        >
          Legal
        </h4>
        <ul class="space-y-4 text-sm">
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#"
              >Termos de Uso</a
            >
          </li>
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#"
              >Privacidade</a
            >
          </li>
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#">LGPD</a>
          </li>
          <li>
            <a class="hover:text-sky-400 transition-colors" href="#"
              >Segurança</a
            >
          </li>
        </ul>
      </div>
    </div>
    <div
      class="max-w-7xl mx-auto mt-16 pt-8 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-4"
    >
      <p class="text-[10px] opacity-50 uppercase tracking-wider">
        © {{ new Date().getFullYear() }} Reserva Aí! Software de Gestão
        Condominial LTDA.
      </p>
      <div class="flex gap-6 text-[10px] opacity-50 uppercase tracking-wider">
        <span>Feito com carinhos para síndicos modernos.</span>
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
