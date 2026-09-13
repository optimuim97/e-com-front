function r(t=new Date){const e=n=>String(n).padStart(2,"0");return`${t.getFullYear()}-${e(t.getMonth()+1)}-${e(t.getDate())}_${e(t.getHours())}h${e(t.getMinutes())}`}export{r as e};
