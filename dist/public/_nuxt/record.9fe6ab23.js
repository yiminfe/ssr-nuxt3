import{a as s,r as e,O as a,j as t,k as l,p as i,s as r,l as n,u as c,x as o,o as d,F as p,y as u,c as m,t as y,S as g,C as v}from"./entry.abd005a0.js";const k={class:"record-page"},h={class:"main-wrapper"},x={class:"column-style"},f={key:0,class:"column-style"},w=["onClick"],C={class:"title"},_={class:"price"},b=s({__name:"record",setup(s){const b=e(),{proxy:j}=v(),$=a(),z=e(!0);return t((()=>{g().then((s=>{const{success:e,message:a,result:t}=s;z.value=!1,e?b.value=t:j.$message.error(a)}))})),(s,e)=>{const a=o("el-skeleton-item"),t=o("el-image"),g=o("el-empty"),v=o("el-skeleton");return d(),l("div",k,[i("div",h,[r(v,{loading:c(z),animated:""},{template:n((()=>[i("div",x,[(d(),l(p,null,u(9,(s=>i("div",{class:"item",key:s},[r(a,{variant:"image",style:{width:"315px",height:"240px","border-radius":"4px"}}),r(a,{variant:"p",style:{width:"100%","margin-top":"15px"}}),r(a,{variant:"p",style:{width:"30%"}})]))),64))])])),default:n((()=>[c(b).length>0?(d(),l("div",f,[(d(!0),l(p,null,u(c(b),((s,e)=>(d(),l("div",{class:"item",key:e,onClick:e=>function(s){const{recordId:e}=s;$.push(`/detail/${e}`)}(s)},[r(t,{src:s.pictureUrl,alt:s.title,loading:"lazy"},null,8,["src","alt"]),i("p",C,y(s.title),1),i("p",_,"¥"+y(s.price),1)],8,w)))),128))])):(d(),m(g,{key:1,description:"暂无浏览记录哦~"}))])),_:1},8,["loading"])])])}}});export{b as default};
