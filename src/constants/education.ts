export interface EducationEntry {
  term: string
  shortDef: string
  detail: string
}

export const EDUCATION: Record<string, EducationEntry> = {
  totalFeatures: {
    term: 'Total Features',
    shortDef: 'The number of annotated elements in the file.',
    detail:
      'A genomic feature is any region of DNA that has been labeled with a biological meaning — such as a gene, exon, or regulatory element. A large GTF file from GENCODE might contain millions of features representing all the known elements in the human genome.',
  },
  uniqueChromosomes: {
    term: 'Chromosomes',
    shortDef: 'The number of chromosomes (or contigs) that have at least one feature.',
    detail:
      'Chromosomes are the long strands of DNA that make up a genome. Humans have 23 pairs (chr1–chr22, chrX, chrY). Annotation files may also include mitochondrial DNA (chrM) and unplaced scaffold sequences (e.g. chrUn_*).',
  },
  featureTypes: {
    term: 'Feature Types',
    shortDef: 'The different categories of annotated elements in the file.',
    detail:
      'Common feature types include: gene (a region that encodes a functional RNA or protein), transcript (a specific RNA product of a gene), exon (the portion of a transcript kept in mature mRNA), CDS (coding sequence that gets translated into protein), and UTR (untranslated regions at the ends of mRNA).',
  },
  strandDistribution: {
    term: 'Strand',
    shortDef: 'Whether a feature is on the forward (+) or reverse (−) strand of DNA.',
    detail:
      'DNA is double-stranded. Genes can be encoded on either the + (forward, sense) or − (reverse, antisense) strand. About half the genes in the human genome are on each strand. A "." means the strand is unknown or not applicable.',
  },
  featureLength: {
    term: 'Feature Length',
    shortDef: 'The size of each annotated feature in base pairs (bp).',
    detail:
      'Feature length is calculated as end − start. Human genes range from a few hundred bp (tiny ncRNAs) to over 2 million bp (CNTNAP2). Exons are typically 50–300 bp, while introns can be hundreds of thousands of bp long. The distribution tells you what kinds of features dominate your annotation.',
  },
  genomicCoverage: {
    term: 'Genomic Coverage',
    shortDef: 'The total number of base pairs covered by features on each chromosome.',
    detail:
      'Coverage is the sum of all feature lengths per chromosome. High coverage means a chromosome has many or very large annotated features. Note: features can overlap (e.g. a gene and its exons), so total coverage can exceed the chromosome length.',
  },
  chromosomeDistribution: {
    term: 'Features per Chromosome',
    shortDef: 'How many features are annotated on each chromosome.',
    detail:
      'Larger chromosomes (chr1, chr2) tend to have more features simply because they have more DNA. This chart lets you spot unusual distributions — for example, if chrX has unusually few CDS features compared to autosomes, that may reflect X-inactivation or annotation bias.',
  },
  bedFormat: {
    term: 'BED Format',
    shortDef: 'Browser Extensible Data — a tab-separated file listing genomic regions.',
    detail:
      'BED files use 0-based, half-open coordinates. The minimum required columns are: chromosome, start, and end. Optional columns add a name, score (0–1000), strand, and display information. BED files are commonly used for peaks from ChIP-seq experiments, ATAC-seq open chromatin regions, or any custom set of genomic intervals.',
  },
  gtfFormat: {
    term: 'GTF Format',
    shortDef: 'Gene Transfer Format — a 9-column tab-separated annotation file.',
    detail:
      'GTF (Gene Transfer Format) uses 1-based, closed coordinates. The 9th column contains key-value attribute pairs like gene_id and transcript_id that link related features together. GTF files are the standard output of genome annotation projects like GENCODE and Ensembl.',
  },
  gffFormat: {
    term: 'GFF/GFF3 Format',
    shortDef: 'General Feature Format — a flexible tab-separated annotation format.',
    detail:
      'GFF3 is the modern version of GFF. Like GTF, it uses 9 columns with 1-based coordinates. The attributes column uses key=value syntax, and parent-child relationships (e.g. exon belongs to transcript) are expressed using the Parent attribute. GFF3 files can represent any type of sequence feature, not just genes.',
  },
}

export const GLOSSARY_TERMS: EducationEntry[] = [
  EDUCATION.totalFeatures,
  EDUCATION.uniqueChromosomes,
  EDUCATION.featureTypes,
  EDUCATION.strandDistribution,
  EDUCATION.featureLength,
  EDUCATION.genomicCoverage,
  EDUCATION.chromosomeDistribution,
  EDUCATION.bedFormat,
  EDUCATION.gtfFormat,
  EDUCATION.gffFormat,
]
