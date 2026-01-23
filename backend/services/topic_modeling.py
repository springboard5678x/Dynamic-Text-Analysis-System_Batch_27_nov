import gensim
from gensim import corpora
from gensim.models import LdaModel, Nmf, CoherenceModel
from typing import List
from .cleaning import clean_text
from wordcloud import WordCloud
import matplotlib.pyplot as plt
import io
import base64



class TopicModeler:
    def __init__(self):
        pass

    # --------------------------------------------------
    # DATA PREPARATION (IMPROVED)
    # --------------------------------------------------
    def _generate_wordcloud_base64(self, word_freqs):
        try:
            # Create a word cloud matching user's requested style 
            # (800x400, white bg, magma colormap, custom stopwords)
            wc = WordCloud(
                width=800, height=400,
                background_color='white',
                prefer_horizontal=0.9,
                colormap='magma',
                min_font_size=10
            ).generate_from_frequencies(word_freqs)
            
            img = wc.to_image()
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            return base64.b64encode(buffer.getvalue()).decode()
        except Exception as e:
            print(f"WordCloud generation failed: {e}")
            return None

    def prepare_data(self, texts: List[str]):

        cleaned = [clean_text(t) for t in texts if t.strip()]
        tokenized = [t.split() for t in cleaned if len(t.split()) >= 3]

        if len(tokenized) < 5:
            return None, None, None

        dictionary = corpora.Dictionary(tokenized)

        dictionary.filter_extremes(
            no_below=max(2, int(len(tokenized) * 0.02)),
            no_above=0.85
        )

        corpus = [dictionary.doc2bow(text) for text in tokenized]

        if not dictionary or not corpus:
            return None, None, None

        return dictionary, corpus, tokenized

    # --------------------------------------------------
    # SCORE PENALTY TO AVOID SMALL-K DOMINANCE
    # --------------------------------------------------
    def _penalize(self, coherence, k):
        return coherence * (1 + 0.03 * k)

    # --------------------------------------------------
    # AUTO-K TOURNAMENT (FIXED)
    # --------------------------------------------------
    def find_optimal_model(self, dictionary, corpus, texts,
                           start_k=2, step=2, max_k=14):

        graph_data = []
        best_lda = {"k": None, "score": -1}
        best_nmf = {"k": None, "score": -1}

        lda_active = True
        nmf_active = True
        tested = 0
        MIN_TEST_K = 3

        topic_range = list(range(start_k, max_k + 1, step))
        print(f"🏆 Topic Tournament: K={topic_range}")

        for k in topic_range:
            tested += 1
            lda_score = nmf_score = 0

            # -------- LDA --------
            if lda_active:
                try:
                    lda = LdaModel(
                        corpus=corpus,
                        id2word=dictionary,
                        num_topics=k,
                        passes=6,
                        random_state=42,
                        alpha="auto"
                    )
                    raw = CoherenceModel(
                        model=lda,
                        texts=texts,
                        dictionary=dictionary,
                        coherence="c_v"
                    ).get_coherence()

                    lda_score = self._penalize(raw, k)

                    if lda_score > best_lda["score"]:
                        best_lda = {"k": k, "score": lda_score}
                    elif tested >= MIN_TEST_K and lda_score < best_lda["score"] * 0.92:
                        lda_active = False

                except Exception as e:
                    print(f"LDA failed @K={k}: {e}")
                    lda_active = False

            # -------- NMF --------
            if nmf_active:
                try:
                    nmf = Nmf(
                        corpus=corpus,
                        id2word=dictionary,
                        num_topics=k,
                        passes=6,
                        random_state=42
                    )
                    raw = CoherenceModel(
                        model=nmf,
                        texts=texts,
                        dictionary=dictionary,
                        coherence="c_v"
                    ).get_coherence()

                    nmf_score = self._penalize(raw, k)

                    if nmf_score > best_nmf["score"]:
                        best_nmf = {"k": k, "score": nmf_score}
                    elif tested >= MIN_TEST_K and nmf_score < best_nmf["score"] * 0.92:
                        nmf_active = False

                except Exception as e:
                    print(f"NMF failed @K={k}: {e}")
                    nmf_active = False

            graph_data.append({
                "k": k,
                "lda_score": round(lda_score, 4),
                "nmf_score": round(nmf_score, 4)
            })

            print(
                f"K={k} | LDA={lda_score:.4f} | NMF={nmf_score:.4f} "
                f"| Active LDA={lda_active}, NMF={nmf_active}"
            )

            if not lda_active and not nmf_active:
                break

        best_config = (
            {"k": best_lda["k"], "model_type": "LDA"}
            if best_lda["score"] >= best_nmf["score"]
            else {"k": best_nmf["k"], "model_type": "NMF"}
        )

        print(f"✅ Final Winner: {best_config}")
        return best_config, graph_data

    # --------------------------------------------------
    # FINAL MODEL TRAINING
    # --------------------------------------------------
    def perform_final_model(self, dictionary, corpus, texts, k, model_type):

        if model_type == "LDA":
            model = LdaModel(
                corpus=corpus,
                id2word=dictionary,
                num_topics=k,
                passes=10,
                random_state=42,
                alpha="auto"
            )
        else:
            model = Nmf(
                corpus=corpus,
                id2word=dictionary,
                num_topics=k,
                passes=10,
                random_state=42
            )

        coherence = CoherenceModel(
            model=model,
            texts=texts,
            dictionary=dictionary,
            coherence="c_v"
        ).get_coherence()

        raw_topics = model.show_topics(formatted=False, num_words=20)

        topics = []
        for tid, words in raw_topics:
            title = " / ".join(w[0].title() for w in words[:3])
            # Generate Word Cloud Image for this topic
            freq_dict = {w[0]: float(w[1]) for w in words}
            wc_image = self._generate_wordcloud_base64(freq_dict)

            topics.append({
                "id": int(tid) + 1,
                "title": title,
                "wordcloud_image": wc_image,
                "keywords": [{"word": w[0], "weight": float(w[1])} for w in words]
            })

        doc_topics = []
        for bow in corpus:
            dist = model.get_document_topics(bow)
            # Ensure index is cast to native int
            top_topic = max(dist, key=lambda x: x[1])[0] if dist else -2
            doc_topics.append(int(top_topic) + 1)


        return {
            "topics": topics,
            "doc_topics": doc_topics,
            "coherence": round(coherence, 4),
            "model_type": model_type,
            "k": k
        }
