'use client';

import Link from 'next/link';
import { useState } from 'react';

const COURSES = {
  'course-1': {
    id: 'course-1',
    title: 'Foundations of Policy Analysis',
    instructor: 'Dr. Ayesha Khan',
    description: 'Essential frameworks and methods for rigorous policy analysis and evaluation',
    modules: [
      {
        id: 'mod-1',
        number: 1,
        title: 'Introduction to Policy Analysis',
        duration: '2 hours',
        content: `Policy analysis is the systematic and structured process of investigating policy issues and evaluating proposed or existing policies. In this module, we'll explore:

• The definition of policy and its role in governance
• Different types of policies (regulatory, distributive, redistributive, constituent)
• The stages of the policy process: agenda-setting, formulation, adoption, implementation, evaluation
• Key analytical frameworks: rational choice, institutional, behavioral, and network approaches

We'll use Pakistan's agricultural policy reform as a case study to understand how these frameworks help us evaluate complex policy decisions.`,
        keyPoints: [
          'Policy is a course of action (or inaction) chosen by government to address problems',
          'Different policy types require different analytical approaches',
          'Understanding the policy process helps identify leverage points for change',
          'Multiple frameworks provide complementary insights',
        ],
        resources: [
          { type: 'Reading', title: 'Weimer & Vining: Policy Analysis (Chapters 1-2)', url: '#' },
          { type: 'Case Study', title: 'Pakistan Agricultural Reform Initiative', url: '#' },
          { type: 'Video', title: 'Policy Process in Action', url: '#' },
        ],
      },
      {
        id: 'mod-2',
        number: 2,
        title: 'Problem Definition & Problem Formulation',
        duration: '2 hours',
        content: `How problems get defined determines what solutions will be considered. This module covers the political and technical dimensions of problem formulation:

• Problem definition vs. problem formulation
• Stakeholder perspectives and competing problem definitions
• Causal theories: understanding root causes vs. symptoms
• Context mapping: historical, institutional, political context

Using case studies from climate policy in Pakistan and the Gulf states, we'll examine how different actors frame the same issue differently.`,
        keyPoints: [
          'Problem definition is inherently political, not purely technical',
          'Different stakeholders legitimately perceive problems differently',
          'Good causal analysis prevents treating symptoms as root causes',
          'Context shapes both problem definition and viable solutions',
        ],
        resources: [
          { type: 'Reading', title: 'Kingdon: Agenda, Alternatives, and Public Policies', url: '#' },
          { type: 'Exercise', title: 'Stakeholder Mapping Template', url: '#' },
          { type: 'Case Study', title: 'Climate Policy Framing in MENA', url: '#' },
        ],
      },
      {
        id: 'mod-3',
        number: 3,
        title: 'Goals, Objectives & Evaluation Criteria',
        duration: '3 hours',
        content: `Clear goals and measurable objectives are essential for evaluating whether a policy achieves its intended effect. This module covers:

• Distinguishing goals (broad aspirations) from objectives (specific, measurable targets)
• Logic models: inputs → activities → outputs → outcomes → impact
• Theory of change: articulating assumptions about how policy leads to desired results
• Evaluation criteria: efficiency, effectiveness, equity, feasibility
• Indicator selection: valid, reliable, and actionable measures

We'll build a logic model for Pakistan's structural economic reform, identifying key assumptions and risks.`,
        keyPoints: [
          'Vague goals lead to unmeasurable policies and arbitrary evaluations',
          'Logic models reveal assumptions that can be tested empirically',
          'Multiple evaluation criteria often create tensions requiring trade-offs',
          'Indicators should be selected based on what matters, not just what\'s easy to measure',
        ],
        resources: [
          { type: 'Template', title: 'Logic Model Worksheet', url: '#' },
          { type: 'Reading', title: 'Mertens: Evaluation of Structural Programs', url: '#' },
          { type: 'Tool', title: 'Indicator Selection Guide', url: '#' },
        ],
      },
      {
        id: 'mod-4',
        number: 4,
        title: 'Policy Alternatives & Comparative Analysis',
        duration: '3 hours',
        content: `Rigorous policy analysis requires comparing multiple alternatives. This module covers methods for generating alternatives and evaluating their relative merits:

• Systematic alternative generation: policy levers and design variables
• Cost-benefit analysis: monetizing benefits and costs, discount rates, sensitivity analysis
• Cost-effectiveness analysis: when benefits can't be monetized
• Multi-criteria decision analysis: comparing alternatives on multiple dimensions
• Comparative case analysis: learning from other contexts

We'll apply these tools to Pakistan's energy security challenge, comparing different policy pathways for diversification.`,
        keyPoints: [
          'Cost-benefit analysis is powerful but has limitations in equity and distribution effects',
          'Multi-criteria methods avoid forcing all values into a single metric',
          'Sensitivity analysis tests how results change with different assumptions',
          'Comparative analysis reveals contextual factors affecting success and failure',
        ],
        resources: [
          { type: 'Tool', title: 'Cost-Benefit Analysis Calculator', url: '#' },
          { type: 'Template', title: 'Multi-Criteria Evaluation Matrix', url: '#' },
          { type: 'Case Study', title: 'Energy Policy Alternatives: Pakistan and Bangladesh', url: '#' },
        ],
      },
      {
        id: 'mod-5',
        number: 5,
        title: 'Implementation & Institutional Design',
        duration: '2.5 hours',
        content: `Even well-designed policies fail due to implementation problems. This module covers:

• Principal-agent problems: how to align implementer incentives with policy goals
• Institutional capacity: financial, technical, and human resource requirements
• Compliance and enforcement: mechanisms for ensuring rule-following
• Political economy of implementation: resistance points and coalition-building
• Adaptive implementation: flexibility when conditions change

Using Pakistan's IMF program experience, we'll analyze why structural reforms repeatedly fail despite international support.`,
        keyPoints: [
          'Implementation failure is often a design problem, not a capacity problem',
          'Incentive structures determine whether officials implement faithfully',
          'Institutional capacity must match policy ambition',
          'Elite capture and political resistance are legitimate analytical concerns, not external factors',
        ],
        resources: [
          { type: 'Reading', title: 'Pressman & Wildavsky: Implementation', url: '#' },
          { type: 'Case Study', title: 'Pakistan Tax Reform: What Happened?', url: '#' },
          { type: 'Framework', title: 'Implementation Feasibility Checklist', url: '#' },
        ],
      },
      {
        id: 'mod-6',
        number: 6,
        title: 'Monitoring, Evaluation & Learning',
        duration: '2.5 hours',
        content: `Systematic monitoring and evaluation enables policy learning and adaptation. This module covers:

• Monitoring vs. evaluation: ongoing data collection vs. impact assessment
• Rigorous impact evaluation: randomized controlled trials, quasi-experimental designs
• Qualitative evaluation: understanding mechanisms and context
• Performance management: using evaluation for accountability and learning
• Policy iteration: using evaluation results to improve subsequent policies

We'll examine how successful policy innovation cycles work in Singapore and South Korea, and what blocks similar learning in Pakistan.`,
        keyPoints: [
          'Many policies are never rigorously evaluated, limiting learning',
          'Randomized evaluation is powerful but not always feasible or ethical',
          'Qualitative evaluation is essential for understanding how and why policies work',
          'Feedback loops between evaluation and implementation are rare in developing countries',
        ],
        resources: [
          { type: 'Reading', title: 'Banerjee & Duflo: Poor Economics (Chapters on Evidence)', url: '#' },
          { type: 'Tool', title: 'Theory-Based Evaluation Framework', url: '#' },
          { type: 'Case Study', title: 'Education Policy Impact Evaluation', url: '#' },
        ],
      },
    ],
  },
};

export default function CoursePage({ params }: { params: { courseId: string } }) {
  const course = COURSES[params.courseId as keyof typeof COURSES];
  const [selectedModule, setSelectedModule] = useState(course?.modules[0] || null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Course Not Found</h1>
          <Link href="/research/academy" className="text-primary hover:text-accent">
            ← Back to Academy
          </Link>
        </div>
      </div>
    );
  }

  const toggleModuleComplete = (moduleId: string) => {
    if (completedModules.includes(moduleId)) {
      setCompletedModules(completedModules.filter((m) => m !== moduleId));
    } else {
      setCompletedModules([...completedModules, moduleId]);
    }
  };

  const progressPercent = (completedModules.length / course.modules.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/research/academy" className="text-blue-200 hover:text-white mb-4 block">
            ← Back to Academy
          </Link>
          <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
          <p className="opacity-90">Instructor: {course.instructor}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Module List */}
          <div className="lg:col-span-1">
            {/* Progress */}
            <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
              <h3 className="font-bold mb-3">Your Progress</h3>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div className="bg-primary h-3 rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
              <p className="text-sm text-gray-600">
                {completedModules.length} of {course.modules.length} modules complete
              </p>
            </div>

            {/* Module Navigation */}
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 font-bold">Modules</div>
              <div className="divide-y divide-gray-200">
                {course.modules.map((module) => {
                  const isCompleted = completedModules.includes(module.id);
                  return (
                    <button
                      key={module.id}
                      onClick={() => setSelectedModule(module)}
                      className={`w-full text-left p-4 hover:bg-light-blue transition ${
                        selectedModule?.id === module.id ? 'bg-light-blue border-l-4 border-primary' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="text-lg">
                          {isCompleted ? '✅' : '📄'}
                        </div>
                        <div>
                          <div className="font-bold text-sm">Module {module.number}</div>
                          <div className="text-xs text-gray-600">{module.duration}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Main Content - Module */}
          <div className="lg:col-span-3">
            {selectedModule && (
              <div className="space-y-6">
                {/* Module Header */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-3xl font-bold mb-2">
                        Module {selectedModule.number}: {selectedModule.title}
                      </h2>
                      <p className="text-gray-600">{selectedModule.duration}</p>
                    </div>
                    <button
                      onClick={() => toggleModuleComplete(selectedModule.id)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                        completedModules.includes(selectedModule.id)
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {completedModules.includes(selectedModule.id) ? '✓ Completed' : 'Mark Complete'}
                    </button>
                  </div>
                </div>

                {/* Module Content */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <h3 className="font-bold text-lg mb-4">Content</h3>
                  <div className="prose prose-sm max-w-none text-gray-700 space-y-4">
                    {selectedModule.content.split('\n\n').map((paragraph, idx) => (
                      <div key={idx}>
                        {paragraph.includes('•') ? (
                          <ul className="space-y-2 ml-4">
                            {paragraph.split('\n').map((line, i) => (
                              <li key={i} className="flex gap-2">
                                {line.startsWith('•') ? (
                                  <>
                                    <span className="text-primary">•</span>
                                    <span>{line.substring(1).trim()}</span>
                                  </>
                                ) : (
                                  line
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p>{paragraph}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Key Points */}
                <div className="bg-light-blue rounded-lg border border-gray-200 p-8">
                  <h3 className="font-bold text-lg mb-4">Key Takeaways</h3>
                  <ul className="space-y-3">
                    {selectedModule.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="text-primary font-bold flex-shrink-0">→</span>
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Resources */}
                <div className="bg-white rounded-lg border border-gray-200 p-8">
                  <h3 className="font-bold text-lg mb-4">Resources</h3>
                  <div className="space-y-3">
                    {selectedModule.resources.map((resource, idx) => (
                      <a
                        key={idx}
                        href={resource.url}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-light-blue transition"
                      >
                        <div>
                          <div className="text-xs text-gray-500 font-medium">{resource.type}</div>
                          <div className="font-medium text-gray-900">{resource.title}</div>
                        </div>
                        <span className="text-primary">→</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex gap-4 justify-between">
                  <button
                    onClick={() => {
                      const currentIdx = course.modules.findIndex((m) => m.id === selectedModule.id);
                      if (currentIdx > 0) setSelectedModule(course.modules[currentIdx - 1]);
                    }}
                    disabled={course.modules[0].id === selectedModule.id}
                    className="px-6 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => {
                      const currentIdx = course.modules.findIndex((m) => m.id === selectedModule.id);
                      if (currentIdx < course.modules.length - 1)
                        setSelectedModule(course.modules[currentIdx + 1]);
                    }}
                    disabled={course.modules[course.modules.length - 1].id === selectedModule.id}
                    className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent disabled:opacity-50"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
