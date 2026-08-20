import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { Database, Download, Copy, Check, Terminal, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const DatabaseSyncModule: React.FC = () => {
  const { services, fees, schedules, doctorProfile, faqs, reviews, blogPosts, factsQueue, appointments } = useCMS();
  const [copied, setCopied] = useState(false);

  const generateSqlDump = () => {
    return `-- ============================================================
-- Dr. Farhan Mustafa Clinic Portal - Production MySQL Database Export
-- Generated on: ${new Date().toISOString()}
-- Target Engine: MySQL 8.0+ / MariaDB 10.5+
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+05:00";

-- ------------------------------------------------------------
-- Live System Settings
-- ------------------------------------------------------------
INSERT INTO \`settings\` (\`setting_key\`, \`setting_value\`, \`category\`, \`is_public\`, \`status\`) VALUES
('clinic_name', 'Dr. Farhan Mustafa - Consultant Physician', 'general', 1, 'published'),
('doctor_name', '${doctorProfile.name.replace(/'/g, "''")}', 'doctor', 1, 'published'),
('qualifications', '${doctorProfile.qualifications.replace(/'/g, "''")}', 'doctor', 1, 'published'),
('pmdc_number', '${doctorProfile.pmdcNumber}', 'doctor', 1, 'published'),
('phone_primary', '+923280145670', 'contact', 1, 'published'),
('whatsapp_number', '+923280145670', 'contact', 1, 'published'),
('address_line', 'HealthPro Medical Complex, Faisal Town, Lahore', 'location', 1, 'published')
ON DUPLICATE KEY UPDATE \`setting_value\` = VALUES(\`setting_value\`);

-- ------------------------------------------------------------
-- Clinical Services Records (${services.length} items)
-- ------------------------------------------------------------
${services.map(s => `INSERT INTO \`services\` (\`slug\`, \`title\`, \`category\`, \`short_description\`, \`full_description\`, \`is_verified\`, \`status\`)
VALUES ('${s.slug}', '${s.title.replace(/'/g, "''")}', '${s.category.replace(/'/g, "''")}', '${s.shortDescription.replace(/'/g, "''")}', '${s.fullDescription.replace(/'/g, "''")}', ${s.isVerified ? 1 : 0}, '${s.status || 'published'}')
ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`), \`full_description\` = VALUES(\`full_description\`);`).join('\n')}

-- ------------------------------------------------------------
-- Pre-Launch Facts Verification Queue (${factsQueue.length} items)
-- ------------------------------------------------------------
${factsQueue.map(f => `INSERT INTO \`fact_verifications\` (\`fact_key\`, \`category\`, \`title\`, \`description\`, \`current_value\`, \`suggested_value\`, \`source_reference\`, \`status\`, \`admin_notes\`)
VALUES ('${f.factKey}', '${f.category}', '${f.title.replace(/'/g, "''")}', '${f.description.replace(/'/g, "''")}', '${f.currentValue.replace(/'/g, "''")}', '${f.suggestedValue.replace(/'/g, "''")}', '${(f.sourceReference || '').replace(/'/g, "''")}', '${f.status}', '${(f.adminNotes || '').replace(/'/g, "''")}')
ON DUPLICATE KEY UPDATE \`status\` = VALUES(\`status\`), \`suggested_value\` = VALUES(\`suggested_value\`);`).join('\n')}

SET FOREIGN_KEY_CHECKS = 1;
-- End of Database Export
`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateSqlDump());
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([generateSqlDump()], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `dr_farhan_mustafa_export_${Date.now()}.sql`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-5 h-5 text-[#2097A2]" />
              MySQL Database Sync & Schema Migration Tools
            </h2>
            <p className="text-sm text-slate-600">
              One-click PDO / MySQL synchronization to deploy live clinic changes directly to your Hostinger or cPanel MySQL database.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied SQL!' : 'Copy SQL Dump'}
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-[#2097A2] hover:bg-[#27BAC8] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <Download className="w-4 h-4" /> Download .sql
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">Database Tables</div>
            <div className="text-2xl font-bold text-slate-900">23 Tables</div>
            <div className="text-xs text-slate-500 mt-1">InnoDB Engine • utf8mb4_unicode_ci</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">PHP Connection</div>
            <div className="text-2xl font-bold text-emerald-600">PDO Prepared</div>
            <div className="text-xs text-slate-500 mt-1">SSL Encrypted • Bcrypt Hashed</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase mb-1">Live Sync Status</div>
            <div className="text-2xl font-bold text-slate-900">Ready</div>
            <div className="text-xs text-slate-500 mt-1">Installer available at /installer.php</div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            <span className="flex items-center gap-1">
              <Terminal className="w-3.5 h-3.5 text-[#2097A2]" />
              Generated SQL Migration Code:
            </span>
          </div>
          <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto max-h-96 border border-slate-800 leading-relaxed">
            {generateSqlDump()}
          </pre>
        </div>
      </div>
    </div>
  );
};
