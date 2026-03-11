export interface JobAnalysis {
  keywords: string[];
  keyphrases: string[];
  skills: string[];
  technologies: string[];
  qualifications: string[];
}

export class AdvancedJobParser {
  // Common English stop words to filter out
  private static stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he', 'in', 'is', 'it',
    'its', 'of', 'on', 'that', 'the', 'to', 'was', 'were', 'will', 'with', 'you', 'your', 'we',
    'our', 'us', 'they', 'them', 'their', 'this', 'these', 'those', 'can', 'could', 'should',
    'would', 'may', 'might', 'must', 'shall', 'do', 'does', 'did', 'have', 'had', 'having',
    'get', 'gets', 'got', 'go', 'goes', 'went', 'come', 'comes', 'came', 'take', 'takes', 'took',
    'make', 'makes', 'made', 'see', 'sees', 'saw', 'know', 'knows', 'knew', 'think', 'thinks',
    'thought', 'say', 'says', 'said', 'tell', 'tells', 'told', 'ask', 'asks', 'asked', 'use',
    'uses', 'used', 'find', 'finds', 'found', 'give', 'gives', 'gave', 'work', 'works', 'worked',
    'call', 'calls', 'called', 'try', 'tries', 'tried', 'need', 'needs', 'needed', 'feel',
    'feels', 'felt', 'become', 'becomes', 'became', 'leave', 'leaves', 'left', 'put', 'puts',
    'mean', 'means', 'meant', 'keep', 'keeps', 'kept', 'let', 'lets', 'begin', 'begins', 'began',
    'seem', 'seems', 'seemed', 'help', 'helps', 'helped', 'talk', 'talks', 'talked', 'turn',
    'turns', 'turned', 'start', 'starts', 'started', 'show', 'shows', 'showed', 'hear', 'hears',
    'heard', 'play', 'plays', 'played', 'run', 'runs', 'ran', 'move', 'moves', 'moved', 'live',
    'lives', 'lived', 'believe', 'believes', 'believed', 'bring', 'brings', 'brought', 'happen',
    'happens', 'happened', 'write', 'writes', 'wrote', 'provide', 'provides', 'provided', 'sit',
    'sits', 'sat', 'stand', 'stands', 'stood', 'lose', 'loses', 'lost', 'pay', 'pays', 'paid',
    'meet', 'meets', 'met', 'include', 'includes', 'included', 'continue', 'continues', 'continued',
    'set', 'sets', 'change', 'changes', 'changed', 'lead', 'leads', 'led', 'understand', 'understands',
    'understood', 'watch', 'watches', 'watched', 'follow', 'follows', 'followed', 'stop', 'stops',
    'stopped', 'create', 'creates', 'created', 'speak', 'speaks', 'spoke', 'read', 'reads', 'allow',
    'allows', 'allowed', 'add', 'adds', 'added', 'spend', 'spends', 'spent', 'grow', 'grows', 'grew',
    'open', 'opens', 'opened', 'walk', 'walks', 'walked', 'win', 'wins', 'won', 'offer', 'offers',
    'offered', 'remember', 'remembers', 'remembered', 'love', 'loves', 'loved', 'consider', 'considers',
    'considered', 'appear', 'appears', 'appeared', 'buy', 'buys', 'bought', 'wait', 'waits', 'waited',
    'serve', 'serves', 'served', 'die', 'dies', 'died', 'send', 'sends', 'sent', 'expect', 'expects',
    'expected', 'build', 'builds', 'built', 'stay', 'stays', 'stayed', 'fall', 'falls', 'fell',
    'cut', 'cuts', 'reach', 'reaches', 'reached', 'kill', 'kills', 'killed', 'remain', 'remains',
    'remained', 'suggest', 'suggests', 'suggested', 'raise', 'raises', 'raised', 'pass', 'passes',
    'passed', 'sell', 'sells', 'sold', 'require', 'requires', 'required', 'report', 'reports',
    'reported', 'decide', 'decides', 'decided', 'pull', 'pulls', 'pulled'
  ]);

  static async analyzeJobPosting(jobPosting: string): Promise<JobAnalysis> {
    try {
      // Simple approach: split into words, filter stop words, and return meaningful terms
      const keywords = this.extractKeywordsByStopWordRemoval(jobPosting);
      
      // Additional analysis for job-specific terms
      const skills = this.extractSkills(jobPosting);
      const technologies = this.extractTechnologies(jobPosting);
      const qualifications = this.extractQualifications(jobPosting);
      const keyphrases = this.extractSimpleKeyphrases(jobPosting);

      console.log('Extracted analysis:', {
        keywords,
        keyphrases,
        skills,
        technologies,
        qualifications
      });

      return {
        keywords,
        keyphrases,
        skills,
        technologies,
        qualifications
      };
    } catch (error) {
      console.error('Error analyzing job posting:', error);
      return {
        keywords: [],
        keyphrases: [],
        skills: [],
        technologies: [],
        qualifications: []
      };
    }
  }

  // Simple keyword extraction by removing stop words
  private static extractKeywordsByStopWordRemoval(text: string): string[] {
    // First, protect special programming terms
    let cleanText = text.toLowerCase();
    
    // Protect common programming languages with special characters
    const specialTerms = new Map<string, string>();
    const protectedPatterns = [
      /\bc\+\+/g,
      /\bc#/g,
      /\bf#/g,
      /\bvb\.net/g,
      /\basp\.net/g,
      /\bnode\.js/g,
      /\bnext\.js/g,
      /\bnuxt\.js/g,
      /\bangular\.js/g,
      /\bvue\.js/g,
      /\breact\.js/g,
      /\bspring\.boot/g,
      /\bentity\.framework/g
    ];
    
    // Replace special terms with placeholders
    protectedPatterns.forEach((pattern, index) => {
      const matches = cleanText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const placeholder = `PROTECTED_TERM_${index}_${Object.keys(specialTerms).length}`;
          specialTerms.set(placeholder, match);
          cleanText = cleanText.replace(match, placeholder);
        });
      }
    });
    
    // Clean the text and split into words
    const words = cleanText
      .replace(/[^\w\s\-_.]/g, ' ') // Remove punctuation except hyphens, underscores, and dots
      .replace(/\s+/g, ' ') // Normalize whitespace
      .split(' ')
      .map(word => {
        // Restore protected terms
        return specialTerms.get(word) || word;
      })
      .filter(word => 
        word.length > 2 && // Keep words longer than 2 characters
        word.length < 20 && // Remove very long words (likely URLs or garbled text)
        !this.stopWords.has(word.replace(/[+#.]/g, '')) && // Remove stop words (check without special chars)
        !this.isNumber(word) && // Remove pure numbers
        !this.isCommonFiller(word) // Remove other common filler words
      );

    // Count word frequency and return most common meaningful words
    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    // Sort by frequency and return top keywords
    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 50) // Take top 50 most frequent words
      .map(entry => entry[0]);
  }

  // Extract simple keyphrases (2-3 word combinations)
  private static extractSimpleKeyphrases(text: string): string[] {
    // First, protect special programming terms
    let cleanText = text.toLowerCase();
    
    // Protect common programming languages with special characters
    const specialTerms = new Map<string, string>();
    const protectedPatterns = [
      /\bc\+\+/g,
      /\bc#/g,
      /\bf#/g,
      /\bvb\.net/g,
      /\basp\.net/g,
      /\bnode\.js/g,
      /\bnext\.js/g,
      /\bnuxt\.js/g,
      /\bangular\.js/g,
      /\bvue\.js/g,
      /\breact\.js/g,
      /\bspring\.boot/g,
      /\bentity\.framework/g
    ];
    
    // Replace special terms with placeholders
    protectedPatterns.forEach((pattern, index) => {
      const matches = cleanText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const placeholder = `PROTECTED_PHRASE_${index}_${Object.keys(specialTerms).length}`;
          specialTerms.set(placeholder, match);
          cleanText = cleanText.replace(match, placeholder);
        });
      }
    });

    const words = cleanText
      .replace(/[^\w\s\-_.]/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .map(word => {
        // Restore protected terms
        return specialTerms.get(word) || word;
      })
      .filter(word => word.length > 2 && !this.stopWords.has(word.replace(/[+#.]/g, '')));

    const keyphrases = new Set<string>();

    // Extract 2-word phrases
    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      if (phrase.length > 6 && phrase.length < 30) {
        keyphrases.add(phrase);
      }
    }

    // Extract 3-word phrases
    for (let i = 0; i < words.length - 2; i++) {
      const phrase = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
      if (phrase.length > 10 && phrase.length < 40) {
        keyphrases.add(phrase);
      }
    }

    return Array.from(keyphrases).slice(0, 30);
  }

  // Helper methods
  private static isNumber(word: string): boolean {
    return /^\d+$/.test(word);
  }

  private static isCommonFiller(word: string): boolean {
    const fillerWords = new Set([
      'about', 'after', 'all', 'also', 'any', 'back', 'because', 'been', 'before', 'being',
      'between', 'both', 'but', 'each', 'even', 'every', 'first', 'good', 'great', 'here',
      'how', 'into', 'just', 'last', 'like', 'long', 'most', 'new', 'no', 'not', 'now',
      'old', 'only', 'other', 'out', 'over', 'own', 'people', 'right', 'same', 'she',
      'some', 'still', 'such', 'than', 'then', 'there', 'through', 'time', 'two', 'up',
      'very', 'want', 'way', 'well', 'what', 'when', 'where', 'which', 'who', 'why',
      'without', 'yes', 'yet', 'more', 'much', 'many', 'little', 'few', 'several',
      'during', 'within', 'around', 'under', 'above', 'below', 'across', 'along'
    ]);
    return fillerWords.has(word);
  }

  // Extract programming languages and technical skills
  private static extractSkills(text: string): string[] {
    const skillPatterns = [
      // Programming languages
      /\b(javascript|typescript|python|java|c\+\+|c#|go|rust|php|ruby|swift|kotlin|scala)\b/gi,
      // Frameworks and libraries
      /\b(react|angular|vue|node\.js|express|django|flask|spring|laravel|rails)\b/gi,
      // Soft skills
      /\b(leadership|teamwork|communication|problem[- ]solving|analytical|creative)\b/gi
    ];

    const skills = new Set<string>();
    skillPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => skills.add(match.toLowerCase()));
    });

    return Array.from(skills);
  }

  // Extract technologies, tools, and platforms
  private static extractTechnologies(text: string): string[] {
    const techPatterns = [
      // Cloud platforms
      /\b(aws|azure|google cloud|gcp|docker|kubernetes|terraform)\b/gi,
      // Databases
      /\b(mysql|postgresql|mongodb|redis|elasticsearch|sql server|oracle)\b/gi,
      // Tools and methodologies
      /\b(git|github|gitlab|jenkins|ci\/cd|agile|scrum|devops)\b/gi
    ];

    const technologies = new Set<string>();
    techPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => technologies.add(match.toLowerCase()));
    });

    return Array.from(technologies);
  }

  // Extract education and certification requirements
  private static extractQualifications(text: string): string[] {
    const qualificationPatterns = [
      /\b(bachelor'?s|master'?s|phd|degree|certification|certificate)\b/gi,
      /\b(\d+)\+?\s*years?\s*(of\s*)?experience/gi,
      /\b(aws|microsoft|google|oracle|cisco)\s*(certified|certification)/gi
    ];

    const qualifications = new Set<string>();
    qualificationPatterns.forEach(pattern => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => qualifications.add(match.toLowerCase()));
    });

    return Array.from(qualifications);
  }
}