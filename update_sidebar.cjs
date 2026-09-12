const fs = require('fs');
let code = fs.readFileSync('src/components/layout/Sidebar.tsx', 'utf8');

// Replace standard colors with more vibrant versions and add bgTint
code = code.replace(/color: 'text-amber-500',\n\s*bg: 'group-hover:bg-amber-500\/10',/g, "color: 'text-amber-600 dark:text-amber-400',\n      bgTint: 'bg-amber-100 dark:bg-amber-900/40',\n      bg: 'group-hover:bg-amber-500/10',");
code = code.replace(/color: 'text-sky-500',\n\s*bg: 'group-hover:bg-sky-500\/10',/g, "color: 'text-sky-600 dark:text-sky-400',\n      bgTint: 'bg-sky-100 dark:bg-sky-900/40',\n      bg: 'group-hover:bg-sky-500/10',");
code = code.replace(/color: 'text-indigo-500',\n\s*bg: 'group-hover:bg-indigo-500\/10',/g, "color: 'text-indigo-600 dark:text-indigo-400',\n      bgTint: 'bg-indigo-100 dark:bg-indigo-900/40',\n      bg: 'group-hover:bg-indigo-500/10',");
code = code.replace(/color: 'text-emerald-500',\n\s*bg: 'group-hover:bg-emerald-500\/10',/g, "color: 'text-emerald-600 dark:text-emerald-400',\n      bgTint: 'bg-emerald-100 dark:bg-emerald-900/40',\n      bg: 'group-hover:bg-emerald-500/10',");
code = code.replace(/color: 'text-violet-500',\n\s*bg: 'group-hover:bg-violet-500\/10',/g, "color: 'text-violet-600 dark:text-violet-400',\n      bgTint: 'bg-violet-100 dark:bg-violet-900/40',\n      bg: 'group-hover:bg-violet-500/10',");
code = code.replace(/color: 'text-teal-500',\n\s*bg: 'group-hover:bg-teal-500\/10',/g, "color: 'text-teal-600 dark:text-teal-400',\n      bgTint: 'bg-teal-100 dark:bg-teal-900/40',\n      bg: 'group-hover:bg-teal-500/10',");
code = code.replace(/color: 'text-blue-500',\n\s*bg: 'group-hover:bg-blue-500\/10',/g, "color: 'text-blue-600 dark:text-blue-400',\n      bgTint: 'bg-blue-100 dark:bg-blue-900/40',\n      bg: 'group-hover:bg-blue-500/10',");
code = code.replace(/color: 'text-emerald-600',\n\s*bg: 'group-hover:bg-emerald-500\/10',/g, "color: 'text-emerald-600 dark:text-emerald-400',\n      bgTint: 'bg-emerald-100 dark:bg-emerald-900/40',\n      bg: 'group-hover:bg-emerald-500/10',");
code = code.replace(/color: 'text-rose-500',\n\s*bg: 'group-hover:bg-rose-500\/10',/g, "color: 'text-rose-600 dark:text-rose-400',\n      bgTint: 'bg-rose-100 dark:bg-rose-900/40',\n      bg: 'group-hover:bg-rose-500/10',");
code = code.replace(/color: 'text-orange-500',\n\s*bg: 'group-hover:bg-orange-500\/10',/g, "color: 'text-orange-600 dark:text-orange-400',\n      bgTint: 'bg-orange-100 dark:bg-orange-900/40',\n      bg: 'group-hover:bg-orange-500/10',");
code = code.replace(/color: 'text-pink-500',\n\s*bg: 'group-hover:bg-pink-500\/10',/g, "color: 'text-pink-600 dark:text-pink-400',\n      bgTint: 'bg-pink-100 dark:bg-pink-900/40',\n      bg: 'group-hover:bg-pink-500/10',");
code = code.replace(/color: 'text-slate-500',\n\s*bg: 'group-hover:bg-slate-500\/10',/g, "color: 'text-slate-600 dark:text-slate-400',\n      bgTint: 'bg-slate-200 dark:bg-slate-800',\n      bg: 'group-hover:bg-slate-500/10',");
code = code.replace(/color: 'text-cyan-500',\n\s*bg: 'group-hover:bg-cyan-500\/10',/g, "color: 'text-cyan-600 dark:text-cyan-400',\n      bgTint: 'bg-cyan-100 dark:bg-cyan-900/40',\n      bg: 'group-hover:bg-cyan-500/10',");

code = code.replace(
  /className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all \${(.*?)isActive(.*?)bg-white\/20 text-white(.*?): \`bg-slate-100 dark:bg-slate-800 \${item.color} \${item.bg}\`(.*?)}`}/gs,
  "className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${isActive ? 'bg-white/20 text-white' : `${item.bgTint} ${item.color} ${item.bg}`}`}"
);

fs.writeFileSync('src/components/layout/Sidebar.tsx', code);
