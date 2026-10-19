import React, { useState } from 'react';
import {
  TerminalSquare,
  BookOpen,
  Award,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Flag,
  Send
} from 'lucide-react';
import { PracticeLabChallenge } from '../types/security';

const LAB_CHALLENGES: PracticeLabChallenge[] = [
  {
    id: 'lab-01',
    title: 'Network Reconnaissance & Service Fingerprinting',
    category: 'Reconnaissance',
    difficulty: 'Beginner',
    description: 'Learn how ethical pentesters inspect network ports using TCP SYN scans, analyze service banners, and detect hidden administration ports.',
    scenario: 'You are auditing a newly deployed internal web portal (10.10.10.42). Your mission is to discover open services, inspect HTTP headers, and locate an exposed backup tarball in robots.txt.',
    objectives: [
      'Run a service version scan using "nmap -sV 10.10.10.42" in the terminal below.',
      'Inspect the web server HTTP headers using "curl -I 10.10.10.42".',
      'Identify the hidden admin backup archive and submit the flag: "flag FLAG{ETHICAL_RECON_2026}".'
    ],
    hints: [
      'Type "help" in the terminal to see available sandbox commands.',
      'Check the nmap output carefully under port 8080/tcp for robots.txt details.'
    ],
    simulatedEnvironment: {
      hostname: 'sandbox-target.lab (10.10.10.42)',
      openServices: ['21/ftp (vsftpd 3.0.3)', '22/ssh (OpenSSH 8.9p1)', '80/http', '8080/http-proxy'],
      hiddenFlag: 'FLAG{ETHICAL_RECON_2026}'
    },
    quizQuestions: [
      {
        question: 'Which TCP flag is initially sent by a client to initiate the 3-way handshake?',
        options: ['ACK', 'SYN', 'FIN', 'RST'],
        correctIndex: 1,
        explanation: 'The TCP handshake begins with a SYN packet from the client, followed by SYN-ACK from the server, and completed with an ACK from the client.'
      },
      {
        question: 'Why is banner grabbing valuable in defensive cybersecurity auditing?',
        options: [
          'It allows downloading the target hard drive automatically.',
          'It reveals the software name and exact version number to cross-reference with CVE databases.',
          'It bypasses perimeter firewalls by encrypting all traffic.',
          'It disables logging on the remote server.'
        ],
        correctIndex: 1,
        explanation: 'Service banners display software daemon names and version numbers, allowing security teams to pinpoint known unpatched vulnerabilities.'
      }
    ]
  },
  {
    id: 'lab-02',
    title: 'Linux Defense: Permissions & Account Auditing',
    category: 'Linux Defense',
    difficulty: 'Intermediate',
    description: 'Master essential Linux hardening techniques: checking /etc/passwd permissions, auditing listening sockets with ss/netstat, and enforcing least privilege.',
    scenario: 'An auditor discovered an unverified service bound to 0.0.0.0:8080. You need to inspect active sockets and check system accounts.',
    objectives: [
      'Print listening sockets using "netstat -tuln" or "ss -tulpn".',
      'Examine configured user accounts using "cat /etc/passwd".',
      'Verify the defensive iptables rule using "iptables -L -n -v".',
      'Submit the verification flag: "flag FLAG{SECURE_CIPHER_SUITE}".'
    ],
    hints: [
      'Use "netstat -tuln" to view which ports are bound to all interfaces (0.0.0.0).',
      'Submit flag with "flag FLAG{SECURE_CIPHER_SUITE}".'
    ],
    simulatedEnvironment: {
      hostname: 'defense-node.lab',
      openServices: ['22/sshd', '80/apache2', '443/apache2', '5432/postgres', '8080/python3'],
      hiddenFlag: 'FLAG{SECURE_CIPHER_SUITE}'
    },
    quizQuestions: [
      {
        question: 'Which Linux permission mode prevents non-root users from modifying /etc/passwd?',
        options: ['chmod 777', 'chmod 644 (rw-r--r--)', 'chmod 666', 'chmod 000'],
        correctIndex: 1,
        explanation: 'The file /etc/passwd must be readable by all users (644) so applications can look up user names, but only writable by root (uid 0).'
      },
      {
        question: 'What is the main security risk of binding a database daemon to 0.0.0.0 instead of 127.0.0.1?',
        options: [
          'It makes the database slower.',
          'It exposes the database port to all connected network interfaces, including external and untrusted networks.',
          'It wipes the database tables automatically.',
          'It causes a kernel panic.'
        ],
        correctIndex: 1,
        explanation: 'Binding to 0.0.0.0 (INADDR_ANY) listens on all network adapters, exposing the port to potential remote probing unless blocked by a firewall.'
      }
    ]
  },
  {
    id: 'lab-03',
    title: 'Firewall Filtering & iptables Defense',
    category: 'Network Analysis',
    difficulty: 'Advanced',
    description: 'Configure and audit packet filtering tables, prevent unsolicited external sweeps, and enforce stateful inspection.',
    scenario: 'Protect internal Kubernetes management port 2376 from unauthorized external subnets.',
    objectives: [
      'Inspect packet filtering chain rules using "iptables -L -n -v".',
      'Test DNS query lookup using "dig defense.internal.corp".',
      'Submit the lab flag: "flag FLAG{NO_LEAK_FD_ESC}".'
    ],
    hints: [
      'Type "iptables -L -n -v" in the terminal.',
      'Submit flag with "flag FLAG{NO_LEAK_FD_ESC}".'
    ],
    simulatedEnvironment: {
      hostname: 'k8s-shield.lab',
      openServices: ['iptables netfilter', 'nftables'],
      hiddenFlag: 'FLAG{NO_LEAK_FD_ESC}'
    },
    quizQuestions: [
      {
        question: 'What is the default recommended policy for the INPUT chain in a hardened firewall?',
        options: ['ACCEPT', 'DROP', 'LOG', 'FORWARD'],
        correctIndex: 1,
        explanation: 'A hardened firewall follows the "default deny" rule: drop all inbound traffic by default, only allowing explicitly whitelisted ports.'
      }
    ]
  }
];

export const PracticeLabView: React.FC = () => {
  const [activeChallenge, setActiveChallenge] = useState<PracticeLabChallenge>(LAB_CHALLENGES[0]);
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'AegisSec Defensive Practice Environment v2.4 initialized.',
    'Restricted sandbox active. Type "help" to see available defensive tools.',
    'Type "nmap -sV 10.10.10.42" to scan the lab target.'
  ]);
  const [userXp, setUserXp] = useState(250);
  const [completedLabs, setCompletedLabs] = useState<string[]>([]);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<string, boolean>>({});

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim();
    setTerminalInput('');

    if (cmd.toLowerCase() === 'clear') {
      setTerminalHistory([]);
      return;
    }

    setTerminalHistory((prev) => [...prev, `secops@sandbox:~$ ${cmd}`]);

    try {
      const res = await fetch('/api/lab/execute-terminal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd, activeChallengeId: activeChallenge.id })
      });
      const data = await res.json();
      if (data.output) {
        setTerminalHistory((prev) => [...prev, data.output]);
        if (data.output.includes('SUCCESS! Correct flag submitted')) {
          if (!completedLabs.includes(activeChallenge.id)) {
            setCompletedLabs((prev) => [...prev, activeChallenge.id]);
            setUserXp((prev) => prev + 250);
          }
        }
      }
    } catch {
      setTerminalHistory((prev) => [
        ...prev,
        'Error connecting to lab backend daemon.'
      ]);
    }
  };

  const handleSelectQuiz = (qIdx: number, optionIdx: number) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [`${activeChallenge.id}-${qIdx}`]: optionIdx
    }));
  };

  const handleCheckQuiz = (qIdx: number) => {
    setQuizSubmitted((prev) => ({
      ...prev,
      [`${activeChallenge.id}-${qIdx}`]: true
    }));
    const key = `${activeChallenge.id}-${qIdx}`;
    if (quizAnswers[key] === activeChallenge.quizQuestions[qIdx].correctIndex) {
      setUserXp((prev) => prev + 50);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center gap-2">
            <TerminalSquare className="h-5 w-5 text-emerald-400" />
            <span>Ethical Cybersecurity Practice Lab</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Isolated defensive sandbox environments for practicing Linux commands, TCP/IP analysis, firewalls, and security audits.
          </p>
        </div>

        {/* XP Counter */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-950/20 text-emerald-400 font-mono text-xs">
          <Award className="h-4 w-4" />
          <span>Security XP: <strong className="text-emerald-300 font-bold tabular-nums">{userXp}</strong></span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">{completedLabs.length} / {LAB_CHALLENGES.length} Labs Done</span>
        </div>
      </div>

      {/* Lab Module Selector Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {LAB_CHALLENGES.map((lab) => {
          const isSelected = activeChallenge.id === lab.id;
          const isDone = completedLabs.includes(lab.id);

          return (
            <button
              key={lab.id}
              onClick={() => setActiveChallenge(lab)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-emerald-500 bg-slate-900/90 shadow-lg shadow-emerald-950/20'
                  : 'border-slate-800 bg-slate-900/40 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase ${
                  lab.difficulty === 'Beginner'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : lab.difficulty === 'Intermediate'
                    ? 'bg-cyan-500/10 text-cyan-400'
                    : 'bg-purple-500/10 text-purple-400'
                }`}>
                  {lab.difficulty}
                </span>
                {isDone ? (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Solved
                  </span>
                ) : (
                  <span className="text-[11px] font-mono text-slate-500">+250 XP</span>
                )}
              </div>
              <h3 className="text-xs font-bold text-slate-100 mt-2 line-clamp-1">{lab.title}</h3>
              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">{lab.description}</p>
            </button>
          );
        })}
      </div>

      {/* Main Lab Viewport: Scenario + Terminal Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Briefing, Objectives & Quizzes */}
        <div className="lg:col-span-5 space-y-4">
          {/* Briefing */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-emerald-400 uppercase font-semibold">
                Mission Briefing
              </span>
              <span className="text-xs font-mono text-slate-500">
                {activeChallenge.simulatedEnvironment.hostname}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {activeChallenge.scenario}
            </p>

            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <div className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
                Assigned Objectives
              </div>
              {activeChallenge.objectives.map((obj, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{obj}</span>
                </div>
              ))}
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px]">
                <Lightbulb className="h-3.5 w-3.5" />
                <span>Hints & Guidance</span>
              </div>
              {activeChallenge.hints.map((h, i) => (
                <p key={i} className="text-[11px] text-slate-400">{h}</p>
              ))}
            </div>
          </div>

          {/* Practice Quizzes */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-emerald-400" />
                <span>Knowledge Check (+50 XP)</span>
              </h3>
            </div>

            <div className="space-y-4">
              {activeChallenge.quizQuestions.map((quiz, qIdx) => {
                const key = `${activeChallenge.id}-${qIdx}`;
                const chosen = quizAnswers[key];
                const submitted = quizSubmitted[key];
                const isCorrect = submitted && chosen === quiz.correctIndex;

                return (
                  <div key={qIdx} className="space-y-2 p-3 rounded-lg border border-slate-800 bg-slate-950/60">
                    <p className="text-xs font-semibold text-slate-200">
                      {qIdx + 1}. {quiz.question}
                    </p>

                    <div className="space-y-1.5">
                      {quiz.options.map((opt, oIdx) => (
                        <button
                          key={oIdx}
                          disabled={submitted}
                          onClick={() => handleSelectQuiz(qIdx, oIdx)}
                          className={`w-full text-left p-2 rounded text-xs transition-colors flex items-center justify-between ${
                            chosen === oIdx
                              ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40 font-medium'
                              : 'bg-slate-900 text-slate-300 border border-slate-800/80 hover:bg-slate-850'
                          }`}
                        >
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>

                    {!submitted && chosen !== undefined && (
                      <button
                        onClick={() => handleCheckQuiz(qIdx)}
                        className="mt-1 px-3 py-1 text-[11px] font-medium text-white bg-emerald-600 hover:bg-emerald-500 rounded transition-colors"
                      >
                        Submit Answer
                      </button>
                    )}

                    {submitted && (
                      <div className={`p-2 rounded text-[11px] leading-relaxed ${
                        isCorrect ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30' : 'bg-rose-950/40 text-rose-300 border border-rose-500/30'
                      }`}>
                        <div className="font-bold">{isCorrect ? 'Correct!' : 'Incorrect'}</div>
                        <div>{quiz.explanation}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Interactive Simulated Shell */}
        <div className="lg:col-span-7 flex flex-col h-[580px] rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
          {/* Terminal Window Titlebar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-400">
                secops@defense-lab: ~ (Isolated Defensive Sandbox)
              </span>
            </div>
            <button
              onClick={() => setTerminalHistory([])}
              className="text-[11px] font-mono text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Terminal Output Area */}
          <div className="flex-1 p-4 font-mono text-xs text-slate-300 overflow-y-auto space-y-1.5 select-text">
            {terminalHistory.map((line, idx) => (
              <pre
                key={idx}
                className={`whitespace-pre-wrap leading-relaxed ${
                  line.startsWith('secops@')
                    ? 'text-emerald-400 font-semibold'
                    : line.includes('SUCCESS!')
                    ? 'text-emerald-300 font-bold bg-emerald-950/40 p-2 rounded'
                    : line.startsWith('Starting Nmap')
                    ? 'text-cyan-300'
                    : line.startsWith('Chain INPUT')
                    ? 'text-amber-300'
                    : 'text-slate-300'
                }`}
              >
                {line}
              </pre>
            ))}
          </div>

          {/* Terminal Input Line */}
          <form
            onSubmit={handleCommandSubmit}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 border-t border-slate-800"
          >
            <span className="font-mono text-xs text-emerald-400 select-none">
              secops@sandbox:~$
            </span>
            <input
              type="text"
              value={terminalInput}
              onChange={(e) => setTerminalInput(e.target.value)}
              placeholder="e.g. nmap -sV 10.10.10.42 or help"
              className="flex-1 bg-transparent font-mono text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              className="text-xs font-mono text-emerald-400 hover:text-emerald-300 px-2 py-1 rounded bg-slate-800 transition-colors flex items-center gap-1"
            >
              <Send className="h-3 w-3" />
              <span>Exec</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
