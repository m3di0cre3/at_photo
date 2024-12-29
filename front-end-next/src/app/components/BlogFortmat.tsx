'use client'

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image'
import placeHolderImg from '@/app/assets/img/placeholder-img.png';
import TextComponents from '@/app/components/BlogFormat/TextComponents';
import ImageComponents from '@/app/components/BlogFormat/ImageComponents';
import MiscComponents from '@/app/components/BlogFormat/MiscComponents';
import BlogViewer from '@/app/components/BlogViewer';

import downArrow from '@/app/assets/img/down-arrow.png';


interface LineBreak {
    type: 'lineBreak';
}

interface Text {
    type: 'text';
    textType: 'h1' | 'h2' | 'h3' | 'p';
    content: string;
}

interface BlockQuote {
    type: 'blockquote';
    content: string;
    author?: string;
}

interface BulletPoint {
    type: 'bulletPoint';
    title?: string;
    content: string;
}

interface List {
    type: 'list';
    listType: 'numbered' | 'bulleted';
    listTitle?: string;
    content: BulletPoint[];
}

interface Image {
    type: 'image';
    imageType: 'left' | 'right' | 'centerBreak';
    wrappedText?: Text | BlockQuote | List;
    widthPercentage?: number;
    src: string;
    alt: string;
    width: number;
    height: number;
    blurDataURL?: string;
}

interface Video {
    type: 'video';
    title: string;
    src: string; // Link
}

interface BlogComponents {
    title: string;
    description: string;
    date: string;
    author: string;
    components: (LineBreak | Text | BlockQuote | List | Image | Video)[];
}


const BlogFormat: React.FC<BlogComponents> = ({ title, description, date, author, components }) => {
    const [imageSrc, setImageSrc] = useState<{ [key: number]: string }>({});
    const BlogDiv = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(true);
    const fullImgBox = useRef<HTMLDivElement>(null);
    const fullImg = useRef<HTMLImageElement>(null);

    const handleImageError = (index: number) => {
        setImageSrc(prev => ({
        ...prev,
        [index]: placeHolderImg.src
        }));
    };

    const focusImage = (image: Image) => {
        if (fullImgBox.current && fullImg.current) {
            fullImgBox.current.style.display = 'flex';
            fullImg.current.src = image.src;
            console.log(image.src);
        }
    }

    const closeFullImg = () => {
        if (fullImgBox.current) {
            fullImgBox.current.style.display = 'none';
        }
    }

    const scrollToBottom = () => {
        const bottomDiv = document.getElementById('bottom-div');
        if (bottomDiv) {
          bottomDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      };
    
      const handleScroll = () => {
        if (BlogDiv.current) {
          setShowScrollButton((BlogDiv.current.getBoundingClientRect().bottom - window.innerHeight) > 400);
        }
      };
    
      useEffect(() => {
        handleScroll();
      }, []);
    
    
    return <div>
        <div 
        ref={fullImgBox}
        className="fixed inset-0 hidden bg-black/80 items-center justify-center z-50"
        >
            <div className="relative">
                <img 
                ref={fullImg}
                className="w-auto h-auto max-w-[65vw] max-h-[75vh] object-contain rounded-xl"
                alt="Enlarged view"
                />
                <span 
                    onClick={closeFullImg}
                    className="absolute -top-[72px] -right-[56px] text-white text-6xl cursor-pointer hover:text-gray-300"
                >
                    ×
                </span>
            </div>
        </div>

        <div className={`fixed bottom-10 right-3 z-50 transition-opacity duration-300 ${showScrollButton ? 'opacity-100' : 'opacity-0'}`}>
            <button
            onClick={scrollToBottom}
            className="btn btn-circle w-12 h-12 bg-neutral-100 hover:bg-neutral-300 btn-ghost text-white"
            >
            <Image src={downArrow} alt="down arrow" className="w-7 h-7"/>
            </button>
        </div>

        <div className="flex flex-col-reverse lg:flex-row lg:justify-between items-start pt-6 -mb-8 lg:pb-2 lg:mb-0 lg:mr-10">
            <div className="mx-auto w-auto mt-5 lg:mt-0 lg:sticky lg:-top-[calc(4*420px-80px-100vh)]">
                <BlogViewer title={title} />
            </div>
            <div ref={BlogDiv} className="w-[75vw] lg:w-[65vw] mx-auto lg:mx-0">
                <article className="prose max-w-6xl">
                    <h1 className="text-4xl font-bold mb-1 text-black">{title}</h1>
                    <h2 className="text-lg mb-1 text-black">{description}</h2>
                    <p className="mb-[1px] text-gray-700">{author}</p>
                    <p className="mb-6 text-gray-700">{date}</p>
                    {components.map((component, index) => {
                        const output = [];
                        
                        switch (component.type) {
                            case 'text': 
                                output.push(<TextComponents key={index} text={component} type='text' index={index} />);
                                break;
                            case 'blockquote':
                                output.push(<TextComponents key={index} text={component} type='blockquote' index={index} />);
                                break;
                            case 'list':
                                output.push(<TextComponents key={index} text={component} type='list' index={index} />);
                                break;
                            case 'image':
                                output.push(
                                    <ImageComponents 
                                        imageSrc={imageSrc} 
                                        key={`image-${index}`} 
                                        image={component} 
                                        index={index}
                                        handleImageError={handleImageError}
                                        focusImage={focusImage}
                                    />
                                );
                                if (component.wrappedText) {
                                    output.push(
                                        <TextComponents 
                                            key={`text-${index}`} 
                                            text={component.wrappedText} 
                                            type={component.wrappedText.type} 
                                            index={index} 
                                        />
                                    )
                                };
                                if (component.imageType !== 'centerBreak') {
                                    output.push(<div key={`clear-${index}`} className="clear-both" />);
                                }
                                break;
                            case 'video':
                                output.push(<MiscComponents key={index} component={component} type='video' index={index} />);
                                break;
                            case 'lineBreak':
                                output.push(<MiscComponents key={index} component={component} type='lineBreak' index={index} />);
                                break;
                        }
                        
                        return output;
                    })}
                    
                </article>
                <div id="bottom-div"></div>
                <h2 className="block lg:hidden text-center text-black text-2xl font-semibold pt-8">Thanks for Reading!<br/><hr className="border-gray-700 my-6 mx-[1vw] border-t-[3px] opacity-[0.60] rounded-full"/>More Blogs</h2>
            </div>
        </div>
        <hr className="mx-auto w-[70vw] border-gray-700 mt-16 border-t-[3px] opacity-[0.60] rounded-full"/>
        <h2 className="hidden lg:block text-center text-black text-2xl font-semibold pt-10 pb-6">Thanks for Reading!</h2>
    </div>
}

export default BlogFormat