import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Frameworks";

export default function DocsPage() {
  const filePath = path.join(process.cwd(), "PRODUCT-DOCUMENTATION.md");
  const content = fs.readFileSync(filePath, "utf-8");

  return (
    <main className="bg-background min-h-screen selection:bg-brand-primary/30 selection:text-brand-primary overflow-x-hidden pt-32">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pb-32">
        <div className="glass p-10 md:p-16 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-primary/10 rounded-full blur-[100px] -z-10" />
          
          <div className="markdown-body">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-4xl md:text-5xl font-black text-white mb-8" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-2xl md:text-3xl font-bold text-white mt-12 mb-6 border-b border-white/10 pb-4" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-xl font-bold text-white mt-8 mb-4" {...props} />,
                p: ({node, ...props}) => <p className="text-white/70 leading-relaxed mb-6 text-lg" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside text-white/70 mb-6 space-y-2 text-lg" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside text-white/70 mb-6 space-y-2 text-lg" {...props} />,
                li: ({node, ...props}) => <li className="leading-relaxed" {...props} />,
                a: ({node, ...props}) => <a className="text-brand-primary hover:underline" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                code: ({node, inline, ...props}: any) => 
                  inline ? <code className="bg-brand-primary/10 text-brand-primary px-1.5 py-0.5 rounded text-sm font-mono" {...props} /> 
                         : <pre className="bg-rich-black p-4 rounded-xl border border-white/10 overflow-x-auto mb-6"><code className="text-white/80 font-mono text-sm" {...props} /></pre>,
                table: ({node, ...props}) => <div className="overflow-x-auto mb-8"><table className="w-full border-collapse" {...props} /></div>,
                thead: ({node, ...props}) => <thead className="bg-white/5" {...props} />,
                th: ({node, ...props}) => <th className="border border-white/10 px-4 py-3 text-left font-semibold text-white" {...props} />,
                td: ({node, ...props}) => <td className="border border-white/10 px-4 py-3 text-white/70" {...props} />,
                hr: ({node, ...props}) => <hr className="border-white/10 my-10" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
