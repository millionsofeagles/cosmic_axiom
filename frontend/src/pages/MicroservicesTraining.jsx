import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft, Cloud, Shield, Code, AlertTriangle, Search, Database, Lock, Globe, Cpu, GitBranch, Package, Zap, Users, BarChart3, Server, Network, FileText, FileDown, Rocket } from 'lucide-react';

const MicroservicesTraining = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const slides = [
    {
      id: 'title',
      type: 'title',
      content: {
        title: 'Microservices Architecture',
        subtitle: 'Security, Design Patterns & Pentesting Strategies'
      }
    },
    {
      id: 'intro',
      type: 'content',
      title: 'What are Microservices?',
      content: {
        definition: 'Microservices architecture is a design approach where applications are built as a collection of small, independent services that communicate through well-defined APIs.',
        keyPoints: [
          'Each service is self-contained and implements a single business capability',
          'Services can be developed, deployed, and scaled independently',
          'Communication happens through lightweight protocols (HTTP/REST, gRPC, message queues)',
          'Each service typically has its own database (database per service pattern)',
          'Failure isolation - one service failing doesn\'t bring down the entire system'
        ],
        comparison: {
          monolithic: {
            title: 'Monolithic Architecture',
            points: ['Single codebase', 'Shared database', 'Single deployment unit', 'Vertical scaling']
          },
          microservices: {
            title: 'Microservices Architecture',
            points: ['Multiple codebases', 'Distributed databases', 'Independent deployments', 'Horizontal scaling']
          }
        }
      }
    },
    {
      id: 'proscons',
      type: 'proscons',
      title: 'Pros and Cons',
      content: {
        pros: [
          {
            title: 'Independent Deployability',
            description: 'Deploy services independently without affecting others',
            icon: <Package className="w-6 h-6" />
          },
          {
            title: 'Technology Diversity',
            description: 'Use different tech stacks for different services',
            icon: <Code className="w-6 h-6" />
          },
          {
            title: 'Fault Isolation',
            description: 'Service failures are contained and don\'t cascade',
            icon: <Shield className="w-6 h-6" />
          },
          {
            title: 'Scalability',
            description: 'Scale individual services based on demand',
            icon: <Zap className="w-6 h-6" />
          },
          {
            title: 'Team Autonomy',
            description: 'Teams can work independently on services',
            icon: <Users className="w-6 h-6" />
          },
          {
            title: 'Business Alignment',
            description: 'Services map directly to business capabilities',
            icon: <BarChart3 className="w-6 h-6" />
          }
        ],
        cons: [
          {
            title: 'Distributed System Complexity',
            description: 'Network latency, partial failures, data consistency challenges',
            icon: <Network className="w-6 h-6" />
          },
          {
            title: 'Operational Overhead',
            description: 'More services to deploy, monitor, and maintain',
            icon: <Server className="w-6 h-6" />
          },
          {
            title: 'Data Management',
            description: 'Distributed transactions and eventual consistency',
            icon: <Database className="w-6 h-6" />
          },
          {
            title: 'Testing Complexity',
            description: 'Integration testing becomes more challenging',
            icon: <AlertTriangle className="w-6 h-6" />
          },
          {
            title: 'Security Surface',
            description: 'More endpoints and communication channels to secure',
            icon: <Lock className="w-6 h-6" />
          },
          {
            title: 'Service Discovery',
            description: 'Services need to find and communicate with each other',
            icon: <Search className="w-6 h-6" />
          }
        ]
      }
    },
    {
      id: 'cloud',
      type: 'content',
      title: 'Cloud Integration',
      content: {
        intro: 'Microservices and cloud computing are natural partners, enabling organizations to build scalable, resilient applications.',
        benefits: [
          {
            title: 'Auto-scaling',
            description: 'Cloud platforms provide automatic scaling based on load, perfect for microservices that can scale independently'
          },
          {
            title: 'Container Orchestration',
            description: 'Kubernetes, ECS, and other orchestrators manage container lifecycles, health checks, and load balancing'
          },
          {
            title: 'Managed Services',
            description: 'Cloud providers offer managed databases, message queues, and API gateways that reduce operational overhead'
          },
          {
            title: 'Service Mesh',
            description: 'Tools like Istio provide traffic management, security, and observability for service-to-service communication'
          },
          {
            title: 'Serverless Integration',
            description: 'Functions-as-a-Service (Lambda, Cloud Functions) for event-driven microservices'
          }
        ],
        patterns: [
          'API Gateway Pattern - Single entry point for client requests',
          'Circuit Breaker Pattern - Prevent cascading failures',
          'Service Registry Pattern - Dynamic service discovery',
          'Sidecar Pattern - Proxy for cross-cutting concerns',
          'Event Sourcing - Capture all changes as events',
          'CQRS - Separate read and write models'
        ]
      }
    },
    {
      id: 'vulnerabilities',
      type: 'vulnerabilities',
      title: 'Security Vulnerabilities',
      content: {
        categories: [
          {
            title: 'Authentication & Authorization',
            vulnerabilities: [
              'Inconsistent authentication across services',
              'Token relay attacks',
              'Service-to-service authentication bypass',
              'Privilege escalation through service chains'
            ],
            icon: <Lock className="w-8 h-8" />
          },
          {
            title: 'API Security',
            vulnerabilities: [
              'Exposed internal APIs',
              'Missing rate limiting',
              'Injection attacks (SQL, NoSQL, Command)',
              'Insecure direct object references'
            ],
            icon: <Globe className="w-8 h-8" />
          },
          {
            title: 'Data Security',
            vulnerabilities: [
              'Data exposure in transit',
              'Inconsistent encryption standards',
              'Secrets management issues',
              'Data leakage through logs'
            ],
            icon: <Database className="w-8 h-8" />
          },
          {
            title: 'Service Communication',
            vulnerabilities: [
              'Man-in-the-middle attacks',
              'Service spoofing',
              'Replay attacks',
              'Denial of service through cascade failures'
            ],
            icon: <Network className="w-8 h-8" />
          },
          {
            title: 'Container Security',
            vulnerabilities: [
              'Vulnerable base images',
              'Container escape',
              'Insecure container configurations',
              'Exposed container management APIs'
            ],
            icon: <Package className="w-8 h-8" />
          },
          {
            title: 'Configuration & Secrets',
            vulnerabilities: [
              'Hardcoded credentials',
              'Exposed configuration endpoints',
              'Insecure secret storage',
              'Configuration injection'
            ],
            icon: <Shield className="w-8 h-8" />
          }
        ]
      }
    },
    {
      id: 'pentesting',
      type: 'content',
      title: 'Pentesting Microservices',
      content: {
        methodology: {
          title: 'Systematic Approach',
          phases: [
            {
              name: 'Discovery & Enumeration',
              tasks: [
                'Service discovery through DNS enumeration',
                'API endpoint mapping',
                'Technology stack fingerprinting',
                'Container registry scanning',
                'Service mesh topology mapping'
              ]
            },
            {
              name: 'Authentication Testing',
              tasks: [
                'JWT token analysis and manipulation',
                'Service-to-service auth bypass attempts',
                'Token relay and replay attacks',
                'Session management testing',
                'OAuth/OIDC flow analysis'
              ]
            },
            {
              name: 'API Security Testing',
              tasks: [
                'Input validation testing',
                'Rate limiting bypass',
                'API versioning exploits',
                'GraphQL specific attacks',
                'REST API method tampering'
              ]
            },
            {
              name: 'Service Communication',
              tasks: [
                'Man-in-the-middle attacks',
                'Service spoofing',
                'Message queue poisoning',
                'gRPC security testing',
                'Service mesh bypass attempts'
              ]
            },
            {
              name: 'Container & Orchestration',
              tasks: [
                'Container escape attempts',
                'Kubernetes API exploitation',
                'Sidecar proxy bypass',
                'Resource exhaustion attacks',
                'Privileged container abuse'
              ]
            }
          ]
        },
        tools: [
          { name: 'Burp Suite', purpose: 'API testing and traffic analysis' },
          { name: 'OWASP ZAP', purpose: 'Automated API scanning' },
          { name: 'Postman/Insomnia', purpose: 'API exploration and testing' },
          { name: 'kube-hunter', purpose: 'Kubernetes security scanning' },
          { name: 'Trivy', purpose: 'Container vulnerability scanning' },
          { name: 'Linkerd/Istio', purpose: 'Service mesh security testing' },
          { name: 'JWT.io', purpose: 'JWT token analysis' },
          { name: 'Wireshark', purpose: 'Network traffic analysis' }
        ]
      }
    },
    {
      id: 'bestpractices',
      type: 'content',
      title: 'Security Best Practices',
      content: {
        practices: [
          {
            category: 'Zero Trust Architecture',
            items: [
              'Implement mutual TLS between services',
              'Use service mesh for traffic encryption',
              'Enforce least privilege access',
              'Regular credential rotation'
            ]
          },
          {
            category: 'API Security',
            items: [
              'Use API gateways for centralized security',
              'Implement rate limiting and throttling',
              'Version APIs properly',
              'Use OpenAPI specifications for validation'
            ]
          },
          {
            category: 'Container Security',
            items: [
              'Scan images for vulnerabilities',
              'Use minimal base images',
              'Run containers as non-root',
              'Implement pod security policies'
            ]
          },
          {
            category: 'Monitoring & Logging',
            items: [
              'Centralized logging with correlation IDs',
              'Distributed tracing implementation',
              'Security event monitoring',
              'Anomaly detection systems'
            ]
          },
          {
            category: 'Secrets Management',
            items: [
              'Use dedicated secret management tools',
              'Encrypt secrets at rest and in transit',
              'Implement secret rotation',
              'Audit secret access'
            ]
          }
        ]
      }
    },
    {
      id: 'cosmicaxiom',
      type: 'cosmicaxiom',
      title: 'Cosmic Axiom: Real-World Implementation',
      content: {
        description: 'Cosmic Axiom is a modern penetration testing report platform - a scalable, AI-powered microservices solution for creating, managing, and exporting professional penetration testing reports.',
        features: [
          'Modern drag-and-drop report builder',
          'Extendable vulnerability finding library',
          'AI-powered executive summaries & conclusions',
          'Evidence & screenshot management',
          'Multi-tenant customer & engagement tracking',
          'PDF and briefing slide deck exports',
          'JWT-based enterprise authentication',
          'Real-time collaborative editing',
          'Dark mode & responsive design',
          'RESTful API for tool integration'
        ],
        services: [
          { name: 'Astral', description: 'Authentication & Authorization Service', color: 'blue', icon: 'Lock' },
          { name: 'Forge', description: 'Customer & Engagement Management', color: 'green', icon: 'Users' },
          { name: 'Library', description: 'Vulnerability & Finding Repository', color: 'purple', icon: 'Database' },
          { name: 'Singularity', description: 'Report Generation & Management', color: 'red', icon: 'FileText' },
          { name: 'Nebula', description: 'AI Integration Service', color: 'yellow', icon: 'Cpu' },
          { name: 'Horizon', description: 'Document Generation Engine', color: 'orange', icon: 'FileDown' },
          { name: 'Satellite', description: 'API Gateway & Orchestration', color: 'cyan', icon: 'Globe' }
        ]
      }
    }
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide + 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentSlide(currentSlide - 1);
        setIsTransitioning(false);
      }, 300);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const renderSlide = (slide) => {
    switch (slide.type) {
      case 'title':
        return (
          <div className="flex flex-col items-center justify-center h-full w-full text-center overflow-hidden px-8 py-8">
            <div className="mb-8">
              <Cloud className="w-24 h-24 text-blue-500 mx-auto mb-4 animate-pulse" />
            </div>
            <h1 className="text-6xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent mb-4">
              {slide.content.title}
            </h1>
            <h2 className="text-2xl text-gray-300 mb-8">{slide.content.subtitle}</h2>
            <p className="text-lg text-gray-400">Mike Hickey</p>
          </div>
        );

      case 'content':
        return (
          <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="w-full h-full flex flex-col px-8 py-8">
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                {slide.title}
              </h2>
              
              <div className="flex-1 overflow-y-auto">
            
            {slide.id === 'intro' && (
              <div>
                <div className="bg-gray-800 rounded-lg p-6 mb-8">
                  <p className="text-lg mb-6">{slide.content.definition}</p>
                  <h3 className="text-xl font-semibold mb-4 text-blue-400">Key Characteristics:</h3>
                  <ul className="space-y-2">
                    {slide.content.keyPoints.map((point, idx) => (
                      <li key={idx} className="flex items-start">
                        <ChevronRight className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-red-900 bg-opacity-20 rounded-lg p-6 border border-red-700">
                    <h4 className="text-xl font-semibold mb-4 text-red-400">
                      {slide.content.comparison.monolithic.title}
                    </h4>
                    <ul className="space-y-2">
                      {slide.content.comparison.monolithic.points.map((point, idx) => (
                        <li key={idx} className="flex items-center">
                          <Server className="w-4 h-4 text-red-500 mr-2" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-blue-900 bg-opacity-20 rounded-lg p-6 border border-blue-700">
                    <h4 className="text-xl font-semibold mb-4 text-blue-400">
                      {slide.content.comparison.microservices.title}
                    </h4>
                    <ul className="space-y-2">
                      {slide.content.comparison.microservices.points.map((point, idx) => (
                        <li key={idx} className="flex items-center">
                          <GitBranch className="w-4 h-4 text-blue-500 mr-2" />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 bg-gradient-to-r from-blue-900 to-purple-900 bg-opacity-20 rounded-lg p-4 border border-purple-700">
                  <div className="flex items-start">
                    <Zap className="w-5 h-5 text-purple-400 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-purple-400">Deployment Flexibility:</span>
                      <span className="text-gray-300 ml-2">
                        A key advantage of microservices architecture is that you can start with a monolithic deployment 
                        (all services running on a single node) and scale out to distributed deployment as needed. 
                        This provides a smooth migration path and reduces initial infrastructure complexity.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {slide.id === 'cloud' && (
              <div className="flex-1 overflow-y-auto">
                <p className="text-lg mb-8">{slide.content.intro}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {slide.content.benefits.map((benefit, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                      <h4 className="text-lg font-semibold mb-2 text-blue-400">{benefit.title}</h4>
                      <p className="text-sm text-gray-300">{benefit.description}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-red-900 to-blue-900 bg-opacity-20 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4 text-white">Common Patterns</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {slide.content.patterns.map((pattern, idx) => (
                      <div key={idx} className="flex items-center">
                        <Cpu className="w-5 h-5 text-yellow-500 mr-2" />
                        <span>{pattern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {slide.id === 'pentesting' && (
              <div className="flex-1 overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-2xl font-semibold mb-4 text-blue-400">{slide.content.methodology.title}</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {slide.content.methodology.phases.map((phase, idx) => (
                      <div key={idx} className="bg-gray-800 rounded-lg p-4">
                        <h4 className="text-lg font-semibold mb-2 text-red-400">{phase.name}</h4>
                        <ul className="space-y-1">
                          {phase.tasks.map((task, tidx) => (
                            <li key={tidx} className="flex items-start">
                              <Search className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                              <span className="text-sm">{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-900 to-red-900 bg-opacity-20 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-3 text-white">Essential Tools</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {slide.content.tools.map((tool, idx) => (
                      <div key={idx} className="flex items-start">
                        <Shield className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                        <div>
                          <span className="font-semibold text-green-400 text-sm">{tool.name}</span>
                          <span className="text-gray-400 text-sm"> - {tool.purpose}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {slide.id === 'bestpractices' && (
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slide.content.practices.map((practice, idx) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                    <h3 className="text-lg font-semibold mb-3 text-blue-400">{practice.category}</h3>
                    <ul className="space-y-2">
                      {practice.items.map((item, iidx) => (
                        <li key={iidx} className="flex items-start">
                          <Lock className="w-4 h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
                </div>
              </div>
            )}
              </div>
            </div>
          </div>
        );

      case 'proscons':
        return (
          <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="w-full h-full flex flex-col px-8 py-8">
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                {slide.title}
              </h2>
              
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                <h3 className="text-2xl font-semibold mb-6 text-green-400">Advantages</h3>
                <div className="space-y-4">
                  {slide.content.pros.map((pro, idx) => (
                    <div key={idx} className="bg-green-900 bg-opacity-20 rounded-lg p-4 border border-green-700 hover:bg-opacity-30 transition-colors">
                      <div className="flex items-start">
                        <div className="text-green-500 mr-3">{pro.icon}</div>
                        <div>
                          <h4 className="font-semibold text-green-300 mb-1">{pro.title}</h4>
                          <p className="text-sm text-gray-300">{pro.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-6 text-red-400">Challenges</h3>
                <div className="space-y-4">
                  {slide.content.cons.map((con, idx) => (
                    <div key={idx} className="bg-red-900 bg-opacity-20 rounded-lg p-4 border border-red-700 hover:bg-opacity-30 transition-colors">
                      <div className="flex items-start">
                        <div className="text-red-500 mr-3">{con.icon}</div>
                        <div>
                          <h4 className="font-semibold text-red-300 mb-1">{con.title}</h4>
                          <p className="text-sm text-gray-300">{con.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              </div>
              </div>
            </div>
          </div>
        );

      case 'vulnerabilities':
        return (
          <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="w-full h-full flex flex-col px-8 py-8">
              <h2 className="text-4xl font-bold mb-8 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                {slide.title}
              </h2>
              
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {slide.content.categories.map((category, idx) => (
                <div key={idx} className="bg-gray-800 rounded-lg p-4 hover:bg-gray-700 transition-colors">
                  <div className="flex items-center mb-3">
                    <div className="text-red-500 mr-2">{category.icon}</div>
                    <h3 className="text-lg font-semibold text-red-400">{category.title}</h3>
                  </div>
                  <ul className="space-y-2">
                    {category.vulnerabilities.map((vuln, vidx) => (
                      <li key={vidx} className="flex items-start">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5 mr-2 flex-shrink-0" />
                        <span className="text-sm">{vuln}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              </div>
              </div>
            </div>
          </div>
        );

      case 'cosmicaxiom':
        return (
          <div className="h-full w-full flex flex-col overflow-hidden">
            <div className="w-full h-full flex flex-col px-8 py-8">
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-red-500 to-blue-500 bg-clip-text text-transparent">
                {slide.title}
              </h2>
              
              <p className="text-lg text-gray-300 mb-6">{slide.content.description}</p>
              
              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
                  {/* Architecture Diagram - Takes up 3 columns */}
                  <div className="lg:col-span-3 bg-gray-800 rounded-lg p-6">
                    <h3 className="text-2xl font-semibold mb-6 text-center text-blue-400">Microservice Architecture</h3>
                    
                    {/* Frontend */}
                    <div className="mb-6 text-center">
                      <div className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-4 mb-4">
                        <div className="text-white font-semibold">React Frontend</div>
                      </div>
                      <div className="text-gray-400">↓</div>
                    </div>
                    
                    {/* API Gateway */}
                    <div className="mb-6 text-center">
                      <div className="inline-block bg-cyan-600 rounded-lg p-4 mb-4">
                        <Globe className="w-8 h-8 text-white mx-auto mb-2" />
                        <div className="text-white font-semibold">Satellite</div>
                        <div className="text-cyan-200 text-sm">API Gateway</div>
                      </div>
                      <div className="text-gray-400">↓</div>
                    </div>
                    
                    {/* Microservices Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                      {slide.content.services.filter(s => s.name !== 'Satellite').map((service, idx) => {
                        const IconComponent = {
                          Lock,
                          Users,
                          Database,
                          FileText,
                          Cpu,
                          FileDown
                        }[service.icon];
                        
                        const bgColor = {
                          blue: 'bg-blue-600',
                          green: 'bg-green-600',
                          purple: 'bg-purple-600',
                          red: 'bg-red-600',
                          yellow: 'bg-yellow-600',
                          orange: 'bg-orange-600'
                        }[service.color];
                        
                        return (
                          <div key={idx} className={`${bgColor} rounded-lg p-4 text-center transform hover:scale-105 transition-transform`}>
                            <IconComponent className="w-8 h-8 text-white mx-auto mb-2" />
                            <div className="text-white font-semibold">{service.name}</div>
                            <div className="text-gray-200 text-xs mt-1">{service.description}</div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Database Layer */}
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">↓</div>
                      <div className="inline-block bg-gray-700 rounded-lg p-4">
                        <Database className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <div className="text-gray-300 font-semibold">MySQL Databases</div>
                        <div className="text-gray-400 text-sm">Isolated per service</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Features List - Right column */}
                  <div className="bg-gray-800 rounded-lg p-6">
                    <h3 className="text-xl font-semibold mb-4 text-green-400">Key Features</h3>
                    <div className="space-y-3">
                      {slide.content.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <Rocket className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      
      <div className="relative z-10 h-screen w-full flex flex-col">
        <div className="px-8 py-4 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Cloud className="w-6 h-6 text-blue-500" />
              <span className="text-sm text-gray-400">Cosmic Chaos - Security Training</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">
                {currentSlide + 1} / {slides.length}
              </span>
              <div className="flex gap-1">
                {slides.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === currentSlide ? 'bg-blue-500' : 'bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 w-full overflow-hidden">
          <div className={`h-full w-full max-h-full transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            {renderSlide(slides[currentSlide])}
          </div>
        </div>

        <div className="px-8 py-4 border-t border-gray-700">
          <div className="flex justify-between items-center">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentSlide === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-red-600 hover:bg-red-700 text-white'
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentSlide === slides.length - 1
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Next
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
};

export default MicroservicesTraining;