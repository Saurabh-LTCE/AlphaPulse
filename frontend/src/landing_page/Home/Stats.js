import React from 'react';

function Stats() {
    return ( 
        <div className='container p-3 '>
            <div className='row p-5'>
                <div className='col-6 p-5'>
                    <h1 className='fs-2 mb-5'>Trust with Confident</h1>

                    <h2 className='fs-4'>Customer-First always</h2>
                    <p className='text-muted'>That's why over 1.3+ crore clients trust AlphaPulse with 3.5+ million trades daily.</p>

                    <h2 className='fs-4'>No Spam or gimmicks</h2>
                    <p className='text-muted'>No gimmicks, no spam - just straightforward, transparent services.High quality customer support.</p>

                    <h2 className='fs-4'>The AlphaPulse Universe</h2>
                    <p className='text-muted'>Not just an app, but a community of investors.Our investment in 30+ fintech startups offer you a unique opportunity to grow your wealth.</p>

                    <h2 className='fs-4'>Do Better With Money</h2>
                    <p className='text-muted'>With initiatives like Nudge and Kill Switch, We don't just facilitate investments - we help you make better financial decisions.</p>
                </div>    

                <div className = 'col-6 p-5'>        
                  <img src='media/images/ecosystem.png' style={{ width: '90%' }}/>
                 <div className='text-center'>
                    <a href='' className='mx-5' style={{ textDecoration: 'none' }}>Explore the Product <i class="fa fa-long-arrow-right" aria-hidden="true"></i></a>
                    <a href='' style={{ textDecoration: 'none' }}>Try Kite Demo <i class="fa fa-long-arrow-right" aria-hidden="true"></i></a>
                  </div>
                </div>
            </div>
        </div>
        
     );
}           

export default Stats;