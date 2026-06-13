import React from 'react';

/**
 * InspectionReport Component
 * Renders the submitted inspection checklist responses, inspector comments, and photographic evidence.
 * Designed to look premium and match the Sage Green (Vehico) design system.
 *
 * @param {Object} props
 * @param {Object} props.report - The inspection report object containing checklist_responses, comments, and image_url.
 * @param {string} [props.appointmentDate] - Optional date of the inspection.
 * @param {string} [props.inspectorName] - Optional name of the inspector.
 */
function InspectionReport({ report, appointmentDate, inspectorName }) {
  if (!report) {
    return (
      <div className="bg-[#f8faf3] border border-[#ecefe8] rounded-2xl p-8 text-center">
        <svg className="mx-auto h-12 w-12 text-[#c5c8be] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="text-sm text-[#757870] italic font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          No inspection report has been submitted yet.
        </p>
      </div>
    );
  }

  const { checklist_responses = {}, comments = '', image_url = '' } = report;
  const checklistEntries = Object.entries(checklist_responses);

  return (
    <div className="space-y-6">
      {/* Inspector Details (if provided) */}
      {(appointmentDate || inspectorName) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#f8faf3] rounded-xl p-4 border border-[#ecefe8]">
          {appointmentDate && (
            <div>
              <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-0.5">Inspection Date</p>
              <p className="text-sm font-bold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {new Date(appointmentDate).toLocaleDateString(undefined, { dateStyle: 'long' })}
              </p>
            </div>
          )}
          {inspectorName && (
            <div>
              <p className="text-xs font-semibold text-[#757870] uppercase tracking-wider mb-0.5">Assigned Inspector</p>
              <p className="text-sm font-bold text-[#191c18]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                {inspectorName}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Checklist Responses */}
      <div>
        <h4 className="text-sm font-bold text-[#757870] uppercase tracking-wider mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Checklist Responses
        </h4>
        {checklistEntries.length > 0 ? (
          <div className="bg-white rounded-xl border border-[#ecefe8] overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <thead>
                <tr className="bg-[#f2f4ed] border-b border-[#ecefe8]">
                  <th className="px-6 py-3.5 text-xs font-bold text-[#757870] uppercase tracking-wider">Checklist Item</th>
                  <th className="px-6 py-3.5 text-xs font-bold text-[#757870] uppercase tracking-wider w-32">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ecefe8]">
                {checklistEntries.map(([id, response]) => (
                  <tr key={id} className="hover:bg-[#f8faf3] transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-[#191c18]">
                      {id.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4">
                      {response === 'pass' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#d9e7cd] text-[#131e0e]">
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                          </svg>
                          Pass
                        </span>
                      ) : response === 'fail' ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#fed7d2] text-[#755754]">
                          <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Fail
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#ecefe8] text-[#444841]">
                          {response}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#757870] italic p-4 bg-[#f8faf3] border border-[#ecefe8] rounded-xl">
            No checklist responses recorded.
          </p>
        )}
      </div>

      {/* Inspector Comments */}
      <div>
        <h4 className="text-sm font-bold text-[#757870] uppercase tracking-wider mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Inspector Remarks
        </h4>
        <div className="bg-[#f8faf3] rounded-xl p-5 border border-[#ecefe8] shadow-sm">
          {comments ? (
            <p className="text-sm text-[#444841] leading-relaxed whitespace-pre-wrap font-medium" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {comments}
            </p>
          ) : (
            <p className="text-sm text-[#757870] italic" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              No comments provided by the inspector.
            </p>
          )}
        </div>
      </div>

      {/* Photographic Evidence */}
      {image_url && (
        <div>
          <h4 className="text-sm font-bold text-[#757870] uppercase tracking-wider mb-3" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Damage Evidence (Photo)
          </h4>
          <div className="space-y-3">
            <div className="relative rounded-2xl overflow-hidden border border-[#ecefe8] bg-black/5 flex items-center justify-center max-w-lg shadow-sm">
              <img
                src={image_url}
                alt="Damage evidence"
                className="max-h-80 w-auto object-contain"
              />
            </div>
            <a
              href={image_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#55624d] hover:text-[#191c18] bg-[#f8faf3] hover:bg-[#f2f4ed] rounded-xl px-4 py-2.5 border border-[#ecefe8] transition-all"
              style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Full Resolution Image
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

export default InspectionReport;
