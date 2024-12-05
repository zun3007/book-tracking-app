import{F as x,r as n,n as a,j as s,m as u,E as b}from"./index-DpF_DXXf.js";import{u as y,I as p,z as i,t as j}from"./InputForm-tWa2Gawp.js";const S=i.object({newPassword:i.string().min(6,"Password must be at least 6 characters").nonempty("New password is required"),confirmPassword:i.string().nonempty("Confirm password is required")}).refine(e=>e.newPassword===e.confirmPassword,{message:"Passwords do not match",path:["confirmPassword"]});function k(){var m,w;const e=x(),[o,l]=n.useState(!1),[f,g]=n.useState(null),{register:c,handleSubmit:h,formState:{errors:d}}=y({resolver:j(S)});n.useEffect(()=>{const r=new URLSearchParams(window.location.hash.substring(1)).get("access_token");r?g(r):(a.error("Missing or invalid reset token."),e("/forgot-password"))},[e]);const P=async r=>{if(!f){a.error("Invalid reset token. Please request a new reset link.");return}l(!0);try{const{error:t}=await b.auth.updateUser({password:r.newPassword});if(t)throw t;a.success("Password reset successfully! Please log in."),e("/login")}catch(t){a.error(t.message||"Failed to reset password.")}finally{l(!1)}};return s.jsx(u.section,{className:"container mx-auto flex flex-col justify-center items-center min-h-screen px-4 py-8 bg-slate-50",initial:{opacity:0,y:30},animate:{opacity:1,y:0},transition:{duration:.8},children:s.jsxs("div",{className:"w-full max-w-md bg-white shadow-lg rounded-lg p-8",children:[s.jsx(u.h1,{className:"text-3xl font-extrabold text-center mb-8 text-slate-700",initial:{opacity:0},animate:{opacity:1},transition:{delay:.2,duration:.8},children:"Reset Password"}),s.jsxs("form",{onSubmit:h(P),className:"space-y-6",children:[s.jsx(p,{type:"password",placeholder:"New Password",error:(m=d.newPassword)==null?void 0:m.message,...c("newPassword")}),s.jsx(p,{type:"password",placeholder:"Confirm Password",error:(w=d.confirmPassword)==null?void 0:w.message,...c("confirmPassword")}),s.jsx("button",{type:"submit",className:`w-full py-3 px-4 rounded-lg text-white ${o?"bg-gray-400 cursor-not-allowed":"bg-blue-500 hover:bg-blue-600 transition"}`,disabled:o,children:o?"Resetting Password...":"Reset Password"})]})]})})}export{k as default};
