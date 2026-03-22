'use client';

import Link from 'next/link';

const COURSES = [
  {
    id: 'course-1',
    title: 'Foundations of Policy Analysis',
    description: 'Essential frameworks and methods for rigorous policy analysis and evaluation',
    modules: 6,
    enrolled: 24,
    difficulty: 'INTERMEDIATE',
    duration: '8 weeks',
    instructor: 'Dr. Ayesha Khan',
    overview: `This course provides a comprehensive introduction to policy analysis frameworks, methodologies, and applications. Participants will learn to evaluate policies systematically, understand trade-offs between different approaches, and engage with real-world case studies across various domains.`,
    moduleList: [
      {
        number: 1,
        title: 'Introduction to Policy Analysis',
        topics: ['Policy definition and types', 'Stages of policy process', 'Analytical frameworks'],
      },
      {
        number: 2,
        title: 'Problem Definition & Problem Formulation',
        topics: ['Identifying and framing problems', 'Stakeholder analysis', 'Context mapping'],
      },
      {
        number: 3,
        title: 'Goals, Objectives & Evaluation Criteria',
        topics: ['Theory of change', 'Logic models', 'Measurement and indicators'],
      },
      {
        number: 4,
        title: 'Policy Alternatives & Comparative Analysis',
        topics: ['Generating alternatives', 'Cost-benefit analysis', 'Multi-criteria evaluation'],
      },
      {
        number: 5,
        title: 'Implementation & Institutional Design',
        topics: ['Implementation feasibility', 'Institutional capacity', 'Compliance mechanisms'],
      },
      {
        number: 6,
        title: 'Monitoring, Evaluation & Learning',
        topics: ['Impact evaluation design', 'Performance monitoring', 'Policy adaptation'],
      },
    ],
  },
];

export default function AcademyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-primary text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <Link href="/research" className="text-blue-200 hover:text-white mb-4 block">
            ← Back to Research
          </Link>
          <h1 className="text-4xl font-bold mb-4">Research Academy</h1>
          <p className="text-lg opacity-90">Structured courses and certification in policy analysis and research methodology</p>
        </div>
      </div>

      {/* Courses */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {COURSES.map((course) => (
            <div key={course.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Course Header */}
              <div className="p-8 border-b border-gray-200">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">{course.title}</h2>
                    <p className="text-gray-600 mb-4">{course.description}</p>
                  </div>
                </div>
                <div className="flex gap-6 flex-wrap text-sm mb-4">
                  <div>
                    <span className="text-gray-500">Duration:</span>
                    <span className="ml-2 font-medium">{course.duration}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Modules:</span>
                    <span className="ml-2 font-medium">{course.modules}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Enrolled:</span>
                    <span className="ml-2 font-medium">{course.enrolled}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Instructor:</span>
                    <span className="ml-2 font-medium">{course.instructor}</span>
                  </div>
                </div>
                <Link
                  href={`/research/academy/${course.id}`}
                  className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:bg-accent font-medium"
                >
                  Start Course
                </Link>
              </div>

              {/* Course Overview */}
              <div className="p-8 bg-light-blue border-b border-gray-200">
                <h3 className="font-bold text-lg mb-3">Course Overview</h3>
                <p className="text-gray-700 leading-relaxed mb-6">{course.overview}</p>
              </div>

              {/* Modules */}
              <div className="p-8">
                <h3 className="font-bold text-lg mb-6">Course Modules</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {course.moduleList.map((module) => (
                    <div key={module.number} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                      <h4 className="font-bold mb-2">
                        Module {module.number}: {module.title}
                      </h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {module.topics.map((topic, idx) => (
                          <li key={idx} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{topic}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
